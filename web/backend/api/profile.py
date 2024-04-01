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
from .models import Game
from livechat.models import PrivateMessage


class UserProfile(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        serializer = UserChangeSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePassword(APIView):
    permission_classes = [permissions.IsAuthenticated]

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
            request.user.set_password(serializer.data.get("new_password"))
            request.user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDelete(APIView):
    permissions_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_active:
            return Response(
                {"detail": "User is not an active account"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            request.user.update_games_after_account_deletion()
            request.user.update_notifications_after_account_deletion()
            request.user.delete_sent_messages()
            # replace username with a random uuid4 (20 chars)
            request.user.username = str(uuid4())[:20]
            request.user.email = str(uuid4())[:20] + "@deleted.com"
            request.user.is_active = False
            request.user.set_password(None)
            request.user.auth_token.delete()
            request.user.save()
            #update_games_after_account_deletion
            return Response(
                {"detail": "User successfully deleted"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": "User could not be deleted"}, status=status.HTTP_400_BAD_REQUEST
            )
        

class DownloadData(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_active:
            return Response(
                {"detail": "User is not an active account"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            data = {
                "username": request.user.username,
                "email": request.user.email,
                "avatar_url": request.user.avatar.url,
                "date_of_account_creation": request.user.date_joined,
                "game_ids": [game.game_id for game in Game.objects.filter(models.Q(player1=request.user) | models.Q(player2=request.user))],
                "tournament_ids": [tournament.tournament_id for tournament in request.user.tournaments.all()],
                "messages_sent": [message.id for message in PrivateMessage.objects.filter(sender=request.user)],
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"detail": "Data could not be downloaded"}, status=status.HTTP_400_BAD_REQUEST
            )
        

# class User(AbstractUser):
#     username = models.CharField(max_length=50, unique=True)
#     email = models.EmailField(max_length=254, unique=True)
#     avatar = models.ImageField(upload_to='avatars/', default="avatars/zippy.jpg", blank=True)
#     online_status = models.BooleanField(default=False)
#     friendlist = models.ManyToManyField('self', blank=True)
#     blocklist = models.ManyToManyField('self', blank=True)
#     tournaments = models.ManyToManyField('Tournament', blank=True)
#     is_oauth = models.BooleanField(default=False)

#     def in_active_game(self):
#         return Game.objects.filter(models.Q(player1=self) | models.Q(player2=self)).filter(status='in progress').exists()


# class Game(models.Model):
#     def __str__(self):
#         return f"{self.player1} vs {self.player2}"

#     game_id = models.AutoField(primary_key=True)
#     player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
#     player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
#     score_player1 = models.IntegerField(default=0)
#     score_player2 = models.IntegerField(default=0)
#     winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner', null=True, blank=True)
#     start_time = models.DateTimeField(auto_now_add=True)
#     end_time = models.DateTimeField(null=True, blank=True)
#     tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, null=True, blank=True)
#     round_name = models.CharField(max_length=50, null=True, blank=True)
#     status = models.CharField(max_length=50, default="waiting for player2")

# class Tournament(models.Model):
#     id = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=50, unique=True)
#     creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tournaments')
#     #participants are a list of inviation notificaitons the creator has sent
#     invitations = models.ManyToManyField(Notification, blank=True)
#     participants = models.ManyToManyField(User, blank=True) # users that have accepted the invitation
#     start_time = models.DateTimeField(auto_now_add=True)
#     state = models.JSONField(default=dict)
#     nb_players = models.IntegerField()

#     def initialize_state(self):
#         state = {}
#         state['quarter-finals'] = []
#         state['semi-finals'] = []
#         state['finals'] = []
#         state['winner'] = None
#         state['status'] = 'waiting for all participants to join'
#         self.state = state
#         self.save()

# class PrivateMessage(models.Model):
#     sender = models.ForeignKey(
#         settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
#     )
#     recipient = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="received_messages",
#     )
#     content = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.sender.username

#     def last_100_messages(self):
#         return PrivateMessage.objects.order_by("-timestamp").all()[:100]
