from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tournament
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, User
from notifications.models import Notification
from notifications.views import send_notification, send_notification_to_user

User = get_user_model()

from django.utils import timezone
import json

def invite_participants_to_tournament(tournament, participants_usernames, sender_username):
    for username in participants_usernames:
        try:
            participant = User.objects.get(username=username)
            data = {
                'sender_username': sender_username,
                'tournament_name': tournament.name,
                'tournament_id': tournament.id,
            }
            notification = send_notification(
                recipient=participant, 
                message="You have been invited to participate in a tournament.", 
                notification_type="tournament-invite", 
                data=data
            )
            tournament.invitations_sent.add(participant)
        except User.DoesNotExist:
            continue


def invite_participant_to_tournament(tournament, participant_username, sender_username):
    try:
        participant = User.objects.get(username=participant_username)
        data = {
            'sender_username': sender_username,
            'tournament_name': tournament.name,
            'tournament_id': tournament.id,
        }
        notification = send_notification(
            recipient=participant, 
            message="You have been invited to participate in a tournament.", 
            notification_type="tournament-invite", 
            data=data
        )
        tournament.invitations_sent.add(participant)
    except User.DoesNotExist:
        pass


class TournamentSerializer(serializers.ModelSerializer):
    participants_username = serializers.ListField(child=serializers.CharField(max_length=50), write_only=True)
    name = serializers.CharField(max_length=50)

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'participants_username']

    def validate(self, data):
        participants_username = data['participants_username']
        if len(participants_username) not in [4, 8, 16]:
            raise serializers.ValidationError("Number of participants must be 4, 8 or 16.")
        
        participants = []
        for username in participants_username:
            try:
                participant = User.objects.get(username=username)
                if participant in participants:
                    raise serializers.ValidationError("Participants must be unique.")
                if self.context['request'].user in participant.blocklist.all():
                    raise serializers.ValidationError(f"You cannot invite {username} because you are on their blocklist.")
                participants.append(participant)
            except User.DoesNotExist:
                raise serializers.ValidationError(f"User {username} does not exist.")
        
        data['participants'] = participants
        return data

    def validate_name(self, name):
        if len(name) < 3:
            raise serializers.ValidationError("Name must be at least 3 characters long.")
        # check if tournament with the same name already exists
        if Tournament.objects.filter(name=name).exists():
            raise serializers.ValidationError("Tournament with this name already exists.")
        return name
    
    def create(self, validated_data):
        participants = validated_data.pop('participants', [])
        name = validated_data.pop('name')

        # Ensure 'participants_username' is removed from validated_data before creating the Tournament instance
        tournament = Tournament.objects.create(name=name, creator=self.context['request'].user)

        tournament.participants.set(participants)
        tournament.initialize_state()
        invite_participants_to_tournament(tournament, validated_data['participants_username'], self.context['request'].user.username)
        return tournament

    

class CreateTournament(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = TournamentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            tournament = serializer.save()
            return Response({'tournament_id': tournament.id}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#the user will pass the tournament id and his decision to accept or decline the invite
class AcceptOrDeclineTournamentInviteSerializer(serializers.Serializer):
    tournament_id = serializers.IntegerField()
    accept = serializers.BooleanField()

    def validate_tournament_id(self, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            if self.context['request'].user not in tournament.participants.all():
                raise serializers.ValidationError("You are not a participant in this tournament.")
            return tournament
        except Tournament.DoesNotExist:
            raise serializers.ValidationError("Tournament does not exist.")

    def validate_accept(self, accept):
        if accept:
            if self.context['request'].user in self.context['tournament'].participants.all():
                raise serializers.ValidationError("You are already a participant in this tournament.")
        return accept
    


