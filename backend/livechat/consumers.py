# myproject/myapp/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)

class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Votre logique de connexion
        self.room_group_name = 'chat_room'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Recevoir un message du WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        logger.warning("Received message: %s", text_data)
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Envoyer le message à la room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Recevoir un message de la room
    async def chat_message(self, event):
        message = event['message']

        # Envoyer le message au WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))