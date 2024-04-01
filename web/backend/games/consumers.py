import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import Game
from rest_framework.authtoken.models import Token


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token_key = self.scope["url_route"]["kwargs"]["token"]
        self.user = await self.get_user(token_key)
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        if (
            self.user
            and await self.is_participant(self.user, self.game_id)
            and not await self.is_finished(self.game_id)
        ):
            group_name = f"game_{self.game_id}"
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            group_name = f"game_{self.game_id}"
            await self.channel_layer.group_discard(group_name, self.channel_name)
            if await self.is_player1(
                self.user, self.game_id
            ) and not await self.is_finished(self.game_id):
                await self.reset_game_status()
                await self.send_update_to_group("Game has been reset")

    @database_sync_to_async
    def reset_game_status(self):
        Game.objects.filter(game_id=self.game_id).update(status="waiting to start")

    @database_sync_to_async
    def is_player1(self, user, game_id):
        game = Game.objects.filter(game_id=game_id).first()
        return game.player1 == user

    @database_sync_to_async
    def get_user(self, token_key):
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None

    async def send_update_to_group(self, message):
        group_name = f"game_{self.game_id}"
        await self.channel_layer.group_send(
            group_name, {"type": "game.update", "message": message}
        )

    @database_sync_to_async
    def is_participant(self, user, game_id):
        game = Game.objects.filter(game_id=game_id).first()
        return game.player1 == user or game.player2 == user

    @database_sync_to_async
    def is_finished(self, game_id):
        game = Game.objects.filter(game_id=game_id).first()
        return game.status == "finished"

    async def game_update(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))
