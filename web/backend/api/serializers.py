from rest_framework import serializers
from .models import User, Game, LiveChat
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
import re
from rest_framework.authtoken.models import Token
from PIL import Image
import os
from uuid import uuid4
from django.conf import settings

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "avatar", "online_status", "is_oauth"]


class UserChangeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, max_length=20)
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ["username", "avatar"]

    def validate(self, data):
        username = data.get("username")
        if username is not None:
            if User.objects.filter(username=username).exists() and username != self.instance.username:
                raise serializers.ValidationError(
                    "A user with that username already exists."
                )
            if len(username) < 5:
                raise serializers.ValidationError(
                    "Username must be at least 5 characters long."
                )
            if not username.isalnum():
                raise serializers.ValidationError(
                    "Username must contain only alphanumeric characters."
                )
        else:
            raise serializers.ValidationError("Username is required.")
        return data

    def validate_avatar(self, value):
        try:
            img = Image.open(value)
        except IOError:
            raise serializers.ValidationError("Invalid image file")

        if value.size > 2 * 1024 * 1024:  # 2MB
            raise serializers.ValidationError("Image file is too large ( > 2mb )")

        if img.width != 128 or img.height != 128:
            raise serializers.ValidationError("Image file must be 128 x 128 pixels")

        ext = os.path.splitext(value.name)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png"]:
            raise serializers.ValidationError("Image file must be a jpg or png file")

        if self.initial_data.get("username") is None:
            raise serializers.ValidationError("Username is required.")
        new_name = f"avatar_{self.initial_data['username']}{uuid4().hex}{ext}"

        value.name = new_name

        return value


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            "game_id",
            "player1",
            "player2",
            "score_player1",
            "score_player2",
            "winner",
            "start_time",
            "end_time",
        ]


class LiveChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveChat
        fields = ["chat_id", "user", "message", "time"]


class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if email is None:
            raise serializers.ValidationError("An email is required to log in.")
        if password is None:
            raise serializers.ValidationError("A password is required to log in.")
        else:
            data = {"email": email, "password": password}
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password", "avatar"]

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            avatar=validated_data["avatar"] if "avatar" in validated_data else None,
            password=make_password(validated_data["password"]),
        )
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        email_regex = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with that username already exists."
            )
        if len(value) < 5:
            raise serializers.ValidationError(
                "Username must be at least 5 characters long."
            )
        if not value.isalnum():
            raise serializers.ValidationError(
                "Username must contain only alphanumeric characters."
            )
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        if not any(char.islower() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one digit."
            )
        if not any(not char.isalnum() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one special character."
            )
        return value

    def validate_avatar(self, value):
        try:
            img = Image.open(value)
        except IOError:
            raise serializers.ValidationError("Invalid image file")

        if value.size > 2 * 1024 * 1024:  # 2MB
            raise serializers.ValidationError("Image file is too large ( > 2mb )")

        if img.width != 128 or img.height != 128:
            raise serializers.ValidationError("Image file must be 128 x 128 pixels")

        ext = os.path.splitext(value.name)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png"]:
            raise serializers.ValidationError("Image file must be a jpg or png file")

        new_name = f"avatar_{self.initial_data['username']}{uuid4().hex}{ext}"

        value.name = new_name

        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )
    new_password = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )
    confirm_new_password = serializers.CharField(
        style={"input_type": "password"}, write_only=True
    )

    def validate(self, data):
        new_password = data.get("new_password")
        confirm_new_password = data.get("confirm_new_password")

        if new_password != confirm_new_password:
            raise serializers.ValidationError("The new passwords do not match.")
        if new_password == data.get("old_password"):
            raise serializers.ValidationError(
                "The new password cannot be the same as the old password."
            )
        return data

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must be at least 8 characters long."
            )
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )
        if not any(char.islower() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one digit."
            )
        if not any(not char.isalnum() for char in value):
            raise serializers.ValidationError(
                "Password must contain at least one special character."
            )
        return value
