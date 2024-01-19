from rest_framework import serializers
from .models import User, Game, LiveChat

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'pseudo', 'email', 'avatar', 'online_status']

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['game_id', 'player1', 'player2', 'score_player1', 'score_player2', 'winner', 'start_time', 'end_time']

class LiveChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveChat
        fields = ['chat_id', 'user', 'message', 'time']