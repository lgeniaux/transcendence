from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer, UserRegistrationSerializer, UserLoginSerializer
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework import serializers
from .serializers import UserSerializer

User = get_user_model()

class AddOrDeleteFriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'action'] # action can be "add" or "delete"

    def validate(self, data):
        request_user = self.context['request'].user
        friend_username = data['username']
        action = data['action']
        self.validate_friend(request_user, friend_username, action)
        return data
    
    def validate_friend(self, request_user, friend_username):
        User = get_user_model()
        if (request_user.action == "add"):
            try:
                friend = User.objects.get(username=friend_username)
            except User.DoesNotExist:
                raise serializers.ValidationError({"detail": "User does not exist"})
            if friend == request_user:
                raise serializers.ValidationError({"detail": "You cannot add yourself to your friendlist"})
            if friend in request_user.friendlist.all():
                raise serializers.ValidationError({"detail": "User is already in your friendlist"})
            if friend in request_user.blocklist.all():
                raise serializers.ValidationError({"detail": "User is in your blocklist"})
            
        if (request_user.action == "delete"):
            try:
                friend = User.objects.get(username=friend_username)
            except User.DoesNotExist:
                raise serializers.ValidationError({"detail": "User does not exist"})
            if friend == request_user:
                raise serializers.ValidationError({"detail": "You cannot delete yourself from your friendlist"})
            if friend not in request_user.friendlist.all():
                raise serializers.ValidationError({"detail": "User is not in your friendlist"})
        else:
            raise serializers.ValidationError({"detail": "Invalid action"})
        return friend


class AddOrDeleteFriend(APIView):
    """
    Add a friend to the user's friendlist
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        friend_serializer = AddOrDeleteFriendSerializer(data=request.data, context={'request': request})
        if friend_serializer.is_valid():
            friend = friend_serializer.validated_data['username']
            request_user = request.user
            if (request_user.action == "add"):
                request_user.friendlist.add(friend)
                return Response({"detail": "User successfully added to your friendlist"}, status=status.HTTP_200_OK)
            if (request_user.action == "delete"):
                request_user.friendlist.remove(friend)
                return Response({"detail": "User successfully removed from your friendlist"}, status=status.HTTP_200_OK)
        else:
            return Response(friend_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class GetUsersListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'avatar', 'online_status']

class GetUsersList(APIView):
    """
    Get a list of all users
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        users = User.objects.all()
        serializer = GetUsersListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)