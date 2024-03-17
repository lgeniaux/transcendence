from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Tournament
from .serializers import TournamentSerializer
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token_key = self.scope['url_route']['kwargs']['token']
        self.user = await self.get_user(token_key)
        self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']

        if self.user:
            group_name = f'tournament_{self.tournament_id}'
            await self.channel_layer.group_add(
                group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            group_name = f'tournament_{self.tournament_id}'
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name
            )

    @database_sync_to_async
    def get_user(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None

