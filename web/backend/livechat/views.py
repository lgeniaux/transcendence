from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework import serializers
from .models import PrivateMessage


class GetConversationMessagesSerializer(serializers.Serializer):
    username = serializers.CharField()
    message_max_count = serializers.IntegerField(required=False)

    def validate_username(self, value):
        if not get_user_model().objects.filter(username=value).exists():
            raise serializers.ValidationError("User does not exist")
        if get_user_model().objects.get(username=value) == self.context["request"].user:
            raise serializers.ValidationError(
                "You do not have a conversation with yourself"
            )
        return value


class GetConversationMessages(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        serializer = GetConversationMessagesSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            other_user = get_user_model().objects.get(
                username=serializer.validated_data["username"]
            )
            messages = PrivateMessage.objects.filter(
                sender=request.user, recipient=other_user
            ) | PrivateMessage.objects.filter(sender=other_user, recipient=request.user)
            messages = messages.order_by("timestamp")
            if "message_max_count" in serializer.validated_data:
                messages = messages[: serializer.validated_data["message_max_count"]]
            else:
                messages = messages[:100]

            return Response(
                [
                    {
                        "sender": message.sender.username,
                        "recipient": message.recipient.username,
                        "content": message.content,
                        "timestamp": message.timestamp,
                    }
                    for message in messages
                ]
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
