from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from api.models import Tournament
from rest_framework.authtoken.models import Token
from channels.db import database_sync_to_async


class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token_key = self.scope["url_route"]["kwargs"]["token"]
        self.user = await self.get_user(token_key)
        self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
        if self.user and await self.is_participant(self.user.id, self.tournament_id):
            group_name = f"tournament_{self.tournament_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            group_name = f"tournament_{self.tournament_id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)

    @database_sync_to_async
    def get_user(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None

    async def send_update_to_group(self, message):
        group_name = f"tournament_{self.tournament_id}"
        # Send message to WebSocket group
        await self.channel_layer.group_send(
            group_name, {"type": "tournament.update", "message": message}
        )

    # Handler for sending a message to this group
    async def tournament_update(self, event):
        message = event["message"]
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def is_participant(self, user_id, tournament_id):
        # Check if the user is in the tournament's participants list
        tournament = Tournament.objects.filter(
            id=tournament_id, participants__id=user_id
        ).first()
        return tournament is not None
