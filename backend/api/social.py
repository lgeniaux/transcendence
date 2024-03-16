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
from notifications.models import Notification

User = get_user_model()
class BlockOrUnblockUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    action = serializers.ChoiceField(choices=["block", "unblock"])

    def validate(self, data):
        request_user = self.context['request'].user
        user_to_block = data['username']
        action = data['action']
        user = self.validate_user(request_user, user_to_block)
        data['user'] = user 
        return data
    
    def validate_user(self, request_user, user_to_block):
        try:
            user = User.objects.get(username=user_to_block)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "User does not exist"})
        if user == request_user:
            raise serializers.ValidationError({"detail": "You cannot block/unblock yourself"})
        return user

class BlockOrUnblockUser(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = BlockOrUnblockUserSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            action = serializer.validated_data['action']
            request_user = request.user

            if action == "block":
                if user in request_user.friendlist.all():
                    request_user.friendlist.remove(user)
                if user in request_user.blocklist.all():
                    return Response({"detail": "User is already in your blocklist"}, status=status.HTTP_400_BAD_REQUEST)
                request_user.blocklist.add(user)
                return Response({"detail": "User successfully blocked"}, status=status.HTTP_200_OK)
            elif action == "unblock":
                if user not in request_user.blocklist.all():
                    return Response({"detail": "User is not in your blocklist"}, status=status.HTTP_400_BAD_REQUEST)
                request_user.blocklist.remove(user)
                return Response({"detail": "User successfully unblocked"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class AddOrDeleteFriendSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    action = serializers.ChoiceField(choices=["add", "delete"])

    def validate(self, data):
        request_user = self.context['request'].user
        friend_username = data['username']
        action = data['action']
        friend = self.validate_friend(request_user, friend_username)
        data['friend'] = friend  
        return data
    
    def validate_friend(self, request_user, friend_username):
        try:
            friend = User.objects.get(username=friend_username)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "User does not exist"})
        if friend == request_user:
            raise serializers.ValidationError({"detail": "You cannot add/delete yourself"})
        return friend


class AddOrDeleteFriend(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = AddOrDeleteFriendSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            friend = serializer.validated_data['friend']
            action = serializer.validated_data['action']
            request_user = request.user

            if action == "add":
                if friend in request_user.blocklist.all():
                    return Response({"detail": "You cannot add a user to your friendlist if you have blocked them"}, status=status.HTTP_400_BAD_REQUEST)
                if friend in request_user.friendlist.all():
                    return Response({"detail": "User is already in your friendlist"}, status=status.HTTP_400_BAD_REQUEST)
                request_user.friendlist.add(friend)
                return Response({"detail": "User successfully added to your friendlist"}, status=status.HTTP_200_OK)
            elif action == "delete":
                if friend not in request_user.friendlist.all():
                    return Response({"detail": "User is not in your friendlist"}, status=status.HTTP_400_BAD_REQUEST)
                request_user.friendlist.remove(friend)
                return Response({"detail": "User successfully removed from your friendlist"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetUsersListSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'avatar', 'online_status', 'status']

    def get_status(self, obj):
        request_user = self.context['request'].user
        if obj in request_user.friendlist.all():
            return 'friends'
        elif obj in request_user.blocklist.all():
            return 'blocked'
        else:
            return 'None'

class GetUsersList(APIView):
    """
    Get a list of all users
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        users = User.objects.all().exclude(id=request.user.id)
        context = {'request': request}
        serializer = GetUsersListSerializer(users, many=True, context=context)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Notifications
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'notification_type', 'created_at', 'data']
    

class GetUserNotifications(APIView):
    """
    Get a list of all notifications for the user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = request.user.notifications.all()
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)