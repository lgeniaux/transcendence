from rest_framework import serializers
from .models import User, Game, LiveChat
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'avatar', 'online_status']

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
        fields = ['username', 'email', 'password', 'avatar']
    
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            avatar=validated_data['avatar'],
            password=make_password(validated_data['password'])
        )
        return user
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value
