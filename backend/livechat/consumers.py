from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token

class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Votre logique de connexion
        token_key = self.scope['url_route']['kwargs']['token']
        self.user = await self.get_user(token_key)
        if self.user:
            await self.channel_layer.group_add(
                "global_chat",
                self.channel_name
            )
            await self.accept()
            # await self.send_last_100_messages()
        else:
            await self.close()
    @database_sync_to_async
    def get_user(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
    async def disconnect(self, close_code):
        # Votre logique de déconnexion
        await self.channel_layer.group_discard(
            "global_chat",
            self.channel_name
        )
    async def receive(self, text_data):
        # Votre logique de réception
        data = json.loads(text_data)
        message = data['message']
        await self.save_message(message)
        print("%s: %s" % (self.user.username, message))
        if (not message.startswith('/')):
            await self.sendGlobalMessage({
                "message": message,
                "sender": self.user.username  # Add the sender username to the message data
            })

    async def sendGlobalMessage(self, event):
        message = event['message']
        sender = event['sender']  # Get the sender username from the event data
        await self.channel_layer.group_send(
            "global_chat",
            {
                "type": "chat.message",
                "message": message,
                "sender": sender  # Pass the sender username to the chat.message event
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']  # Get the sender username from the event data
        await self.send(text_data=json.dumps({
            'sender': sender,  # Use the sender username in the response
            'message': message
        }))

    @database_sync_to_async
    def save_message(self, message):
        Message.objects.create(
            user=self.user,
            content=message
        )