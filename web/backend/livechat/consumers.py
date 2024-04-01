from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import PrivateMessage

User = get_user_model()


class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = None
        token_key = self.scope["url_route"]["kwargs"]["token"]
        user = await self.get_user(token_key)

        if user:
            self.user = user
            self.room_group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if not data.get("message") or not data.get("username"):
            print("no message or target_username")
            return
        message = data["message"]
        target_username = data.get("username")

        if message is None or message == "":
            await self.send(text_data=json.dumps({"error": "message cannot be empty"}))
            return
        if not target_username:
            await self.send(
                text_data=json.dumps({"error": "target_username cannot be empty"})
            )
            return
        if len(message) > 250:
            print("message too long")
            return

        if target_username:
            target_user = await self.get_user_by_username(target_username)
            if target_user and message:
                await self.save_private_message(message, target_user)
                await self.channel_layer.group_send(
                    f"user_{target_user.id}",
                    {
                        "type": "chat_message",
                        "message": message,
                        "sender": self.user.username,
                    },
                )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "sender": event["sender"],
                }
            )
        )

    @database_sync_to_async
    def save_private_message(self, message, target_user):
        PrivateMessage.objects.create(
            sender=self.user, recipient=target_user, content=message
        )

    @database_sync_to_async
    def get_user(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None

    @database_sync_to_async
    def get_user_by_username(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
