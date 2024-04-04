from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions
from .serializers import UserSerializer, ChangePasswordSerializer, UserChangeSerializer
import requests
import random
from uuid import uuid4
from django.db import models
from .models import Game, Tournament
from livechat.models import PrivateMessage
from .IsAuth import IsAuth
from django.shortcuts import get_object_or_404


class UserProfile(APIView):
    permission_classes = [IsAuth]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        if request.user.is_oauth:
            return Response(
                {"detail": "You cannot edit your profile if you are an oauth user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = UserChangeSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            if "avatar" in request.data:
                if request.user.avatar:
                    request.user.avatar.delete()
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePassword(APIView):
    permission_classes = [IsAuth]

    def put(self, request, *args, **kwargs):
        if request.user.is_oauth:
            return Response(
                {"detail": "You cannot change the password of an oauth user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.validated_data.get("old_password")
            if not request.user.check_password(old_password):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            request.user.set_password(serializer.validated_data.get("new_password"))
            request.user.save()
            return Response(
                {"detail": "Password successfully changed"},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDelete(APIView):
    permissions_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_active:
            return Response(
                {"detail": "User is not an active account"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            request.user.update_games_after_account_deletion()
            request.user.update_notifications_after_account_deletion()
            request.user.delete_sent_messages()
            # delete avatar from server and set the default one
            if request.user.avatar:
                request.user.avatar.delete()
                request.user.avatar = "/static/img/person-fill.svg"
            request.user.username = str(uuid4())[:20]
            request.user.email = str(uuid4())[:20] + "@deleted.com"
            request.user.is_active = False
            request.user.set_password(None)
            request.user.auth_token.delete()
            request.user.save()
            return Response(
                {"detail": "User successfully deleted"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": "User could not be deleted"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DownloadData(APIView):

    permission_classes = [IsAuth]

    def get(self, request, *args, **kwargs):
        if not request.user.is_active:
            return Response(
                {"detail": "User is not an active account"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            games = [get_object_or_404(Game, game_id=game.game_id) for game in Game.objects.filter(
                models.Q(player1=request.user) | models.Q(player2=request.user)
            )]
            games_details = [
                {
                    "game_id": game.game_id,
                    "player1": game.player1.username,
                    "player2": game.player2.username,
                    "status": game.status,
                    "winner": game.winner.username if game.winner else None,
                    "score_player1": game.score_player1,
                    "score_player2": game.score_player2,
                    "tournament": game.tournament.name if game.tournament else None,
                    "round_name": game.round_name if game.round_name else None,
                }
                for game in games
            ]
            tournaments = [tournament for tournament in Tournament.objects.filter()]
            tournament_details = [
                {
                    "id": tournament.id,
                    "name": tournament.name,
                    "creator": tournament.creator.username,
                    "participants": [
                        participant.username for participant in tournament.participants.all()
                    ],
                    "start_time": tournament.start_time,
                    "state": tournament.state,
                }
                for tournament in tournaments
            ]
            
            data = {
                "username": request.user.username,
                "email": request.user.email,
                "last_online": request.user.online_status,
                "games": games_details, 
                "tournaments": tournament_details,
                "messages_sent": [
                    {
                        "content": message.content,
                        "recipient": (
                            message.recipient.username if message.recipient else ""
                        ),
                    }
                    for message in PrivateMessage.objects.filter(sender=request.user)
                ],
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": "Data could not be downloaded"},
                status=status.HTTP_400_BAD_REQUEST,
            )
