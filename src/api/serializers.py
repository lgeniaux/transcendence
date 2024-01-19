from rest_framework import serializers
from .models import User, Game, LiveChat
from django.contrib.auth.hashers import make_password

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
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['pseudo', 'email', 'password', 'avatar']
    
    def create(self, validated_data):
        user = User.objects.create(
            pseudo=validated_data['pseudo'],
            email=validated_data['email'],
            avatar=validated_data['avatar'],
            password=make_password(validated_data['password'])
        )
        return user