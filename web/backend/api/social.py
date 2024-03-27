from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game, Tournament
from .serializers import GameSerializer, UserRegistrationSerializer, UserLoginSerializer
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework import serializers
from .serializers import UserSerializer
from notifications.models import Notification
from notifications.views import send_notification
from . import views
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from tournaments.views import broadcast_to_tournament_group
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q



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
        users = User.objects.all().exclude(id=request.user.id).exclude(is_active=False)
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
        #get all notifications with status 'pending' for the user (the invite_status is in the data field)
        notifications = Notification.objects.filter(recipient=request.user, data__status='pending')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ManageInvitationNotificationSerializer(serializers.Serializer):
    notification_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=["accept", "deny"])

    def validate(self, data):
        notification_id = data['notification_id']
        action = data['action']
        request_user = self.context['request'].user
        notification = self.validate_notification(notification_id, request_user)
        data['notification'] = notification
        return data

    def validate_notification(self, notification_id, request_user):
        try:
            notification = Notification.objects.get(id=notification_id, recipient=request_user)
            
        except Notification.DoesNotExist:
            raise serializers.ValidationError({"detail": "Notification does not exist"})
        if notification.notification_type not in ["tournament-invite", "game-invite"]:
            raise serializers.ValidationError({"detail": "Invalid notification type"})

        if notification.notification_type == "tournament-invite" or notification.notification_type == "game-invite":
            if notification.data['status'] != "pending":
                raise serializers.ValidationError({"detail": "This invitation has already been responded to"})
        return notification
    


class ManageInvitationNotification(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ManageInvitationNotificationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            notification = serializer.validated_data['notification']
            action = serializer.validated_data['action']
            request_user = request.user

            if notification.notification_type == "tournament-invite":
                tournament = Tournament.objects.get(id=notification.data['tournament_id'])
                broadcast_message = {
                    'user': request_user.username,
                    'action': action,
                    'message': f"{request_user.username} has {'accepted' if action == 'accept' else 'denied'} the invitation."
                }
                if action == "accept":
                    tournament.participants.add(request_user)
                    notification.data['status'] = "accepted"
                    broadcast_to_tournament_group(tournament.id, broadcast_message)
                    notification.save()
                    tournament.save()
                    if tournament.participants.count() == tournament.nb_players:
                        tournament.start_tournament()
                    return Response({"detail": "Tournament invitation successfully accepted"}, status=status.HTTP_200_OK)
                elif action == "deny":
                    notification.data['status'] = "denied"
                    broadcast_to_tournament_group(tournament.id, broadcast_message)
                    notification.save()
                    tournament.save()
                    return Response({"detail": "Tournament invitation successfully denied"}, status=status.HTTP_200_OK)

            elif notification.notification_type == "game-invite":
                game = Game.objects.get(game_id=notification.data['game_id'])
                if action == "accept":
                    game.player2 = request_user
                    notification.data['status'] = "accepted"
                    game.status = "waiting to start"
                    notification.save()
                    game.save()
                    message = message = f"{request_user.username} has accepted the game invite"
                    data = {
                        'game_id' : game.game_id,
                        'status' : "pending"
                    }
                    send_notification(game.player1, message, 'game-start', data)
                    message = message = f"You have accepted the game invite from {game.player1.username}"
                    data = {
                        'game_id' : game.game_id,
                        'status' : "pending"
                    }
                    send_notification(game.player2, message, 'game-start', data)
                    return Response({"detail": "Game invitation successfully accepted"}, status=status.HTTP_200_OK)
                elif action == "deny":
                    notification.data['status'] = "denied"
                    notification.save()
                    game.delete()
                    return Response({"detail": "Game invitation successfully denied"}, status=status.HTTP_200_OK)
            return Response({"detail": "Action completed successfully"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class InvitePlayerToGameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)

    def validate(self, data):
        request_user = self.context['request'].user
        player_username = data['username']
        player = self.validate_player(request_user, player_username)
        data['player'] = player
        return data
    
    def validate_player(self, request_user, player_username):
        try:
            player = User.objects.get(username=player_username)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "User does not exist"})
        if player == request_user:
            raise serializers.ValidationError({"detail": "You cannot invite yourself to a game"})
        if player in request_user.blocklist.all():
            raise serializers.ValidationError({"detail": "You cannot invite a user you have blocked"})
        if request_user in player.blocklist.all():
            raise serializers.ValidationError({"detail": "You cannot invite a user who has blocked you"})
               # Check if there is already an invitation (game pending) between them
        existing_invitation = Notification.objects.filter(Q(recipient=request_user, data__contains={'game_id': player.id}, notification_type='game-invite') |
            Q(recipient=player, data__contains={'game_id': request_user.id}, notification_type='game-invite'),
            data__contains={'status': 'pending'}
        ).exists()
        if existing_invitation:
            raise serializers.ValidationError({"detail": "An invitation is already pending"})

        # Check if there's an ongoing game between them ( status != 'finished')
        ongoing_game = Game.objects.filter(
            Q(player1=request_user, player2=player) | Q(player1=player, player2=request_user),
            ~Q(status='finished')
        ).exists()
        if ongoing_game:
            raise serializers.ValidationError({"detail": "There's already an ongoing game between you two"})


        return player
    
 
class InvitePlayerToGame(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = InvitePlayerToGameSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            player = serializer.validated_data['player']
            request_user = request.user
            game = Game.objects.create(player1=request_user, player2=player)
            message = f"{request_user.username} has invited you to a game."
            data = {
                'game_id': game.game_id,
                'status': 'pending'
            }
            send_notification(player, message, 'game-invite', data)
            return Response({"detail": "Game invitation sent successfully"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)