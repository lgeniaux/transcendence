from rest_framework import serializers
from .models import User, Game, LiveChat
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
import re
from rest_framework.authtoken.models import Token

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'online_status', 'is_oauth']

class UserChangeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'avatar']

    def validate(self, data):
        #validate username
        username = data.get("username")
        if username is not None:
            if User.objects.filter(username=username).exists():
                raise serializers.ValidationError("A user with that username already exists.")
            # username must be at least 5 characters long, and contain only alphanumeric characters, and no spaces, and no special characters
            if len(username) < 5:
                raise serializers.ValidationError("Username must be at least 5 characters long.")
            if not username.isalnum():
                raise serializers.ValidationError("Username must contain only alphanumeric characters.")
        else:
            raise serializers.ValidationError("Username is required.")
        return data

        
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['game_id', 'player1', 'player2', 'score_player1', 'score_player2', 'winner', 'start_time', 'end_time']

class LiveChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveChat
        fields = ['chat_id', 'user', 'message', 'time']
    
class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if email is None:
            raise serializers.ValidationError("An email is required to log in.")
        if password is None:
            raise serializers.ValidationError("A password is required to log in.")
        else:
            data = {
                'email': email,
                'password': password
            }
        return data
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'avatar']
    
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            avatar=validated_data['avatar'] if 'avatar' in validated_data else None,
            password=make_password(validated_data['password'])
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        # check the regex for email
        email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        # username must be at least 5 characters long, and contain only alphanumeric characters, and no spaces, and no special characters
        if len(value) < 5:
            raise serializers.ValidationError("Username must be at least 5 characters long.")
        if not value.isalnum():
            raise serializers.ValidationError("Username must contain only alphanumeric characters.")
        return value
    
    def validate_password(self, value):
        # password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not any(not char.isalnum() for char in value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    new_password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    confirm_new_password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, data):
        new_password = data.get("new_password")
        confirm_new_password = data.get("confirm_new_password")

        if new_password != confirm_new_password:
            raise serializers.ValidationError("The new passwords do not match.")
        return data
    
    def validate_new_password(self, value):
        # password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one digit, and one special character
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not any(char.islower() for char in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not any(not char.isalnum() for char in value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value
    
class UserDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=False)
    
    def validate_password(self, value):
        # if user is oauth user, then password is not required
        if self.context['request'].user.is_oauth:
            return value
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Invalid password")
        return value
