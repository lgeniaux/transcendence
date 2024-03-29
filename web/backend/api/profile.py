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
        request.user.update_games_after_account_deletion()
        request.user.update_notifications_after_account_deletion()
        request.user.username = "deleted_" + str(random.randint(0, 10000))
        request.user.email = "deleted_" + str(random.randint(0, 10000))
        request.user.is_active = False
        request.user.set_password(None)
        request.user.auth_token.delete()
        request.user.save()
        #update_games_after_account_deletion
        return Response(
            {"detail": "User successfully deleted"}, status=status.HTTP_200_OK
        )
