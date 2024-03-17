from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from .models import Message
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Votre logique de connexion
        token_key = self.scope['url_route']['kwargs']['token']
        self.user = await self.get_user(token_key)
        if self.user:
            group_name = f'user_{self.user.id}'
            await self.channel_layer.group_add(
                group_name,
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
        if self.user:
            group_name = f'user_{self.user.id}'
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name
            )
    async def receive(self, text_data):
        # Votre logique de réception
        data = json.loads(text_data)
        message = data['message']
        await self.save_message(message)
        await self.send_message(message)
    
    async def send_message(self, message):
        # Votre logique d'envoi
        await self.channel_layer.group_send(
            f'user_{self.user.id}',
            {
                'type': 'chat_message',
                'message': message
            }
        )
    async def chat_message(self, event):
        # Votre logique de réception
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
    
    @database_sync_to_async
    def save_message(self, message):
        Message.objects.create(
            user=self.user,
            content=message
        )