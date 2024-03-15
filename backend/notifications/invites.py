from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import GameInvitation
from .models import Tournament

User = get_user_model()

class GameInvitationSerializer(serializers.ModelSerializer):
    recipient_username = serializers.CharField(max_length=50, write_only=True)
    invite_type = serializers.ChoiceField(choices=['duel', 'tournament'], write_only=True)
    tournament_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = GameInvitation
        fields = ('id', 'recipient_username', 'invite_type', 'tournament_id')

    def validate_recipient_username(self, username):
        try:
            recipient = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return recipient
    
    def validate_blocklist(self, recipient):
        if self.context['request'].user in recipient.blocklist.all():
            raise serializers.ValidationError("You cannot invite this user")
        return recipient
    
    
    def create(self, validated_data):
        recipient = validated_data.pop('recipient')
        sender = self.context['request'].user
        invite_type = validated_data.pop('invite_type')
        invitation = GameInvitation.objects.create(sender=sender, recipient=recipient, invite_type=invite_type)
        return invitation
    
