from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import PrivateMessage
import api

User = get_user_model()

class LiveChatConsumer(AsyncWebsocketConsumer):
    #vars 
    async def connect(self):
        # Your connection logic
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


    async def disconnect(self, close_code):
        # Your disconnection logic
        await self.channel_layer.group_discard(
            "global_chat",
            self.channel_name
        )

    # Triggered when a message is received from WebSocket 
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        target_username = data.get('username')
        
        # Récupère l'objet User pour le nom d'utilisateur cible
        target_user = await self.get_user_by_username(target_username)
        
        if target_user:  # S'assure que target_user est un objet User valide
            await self.save_private_message(message, target_user)  # Passe l'objet User à la méthode
            print("%s to %s: %s" % (self.user.username, target_user, message))
            # Envoie le message. Assure-toi que la logique d'envoi est correcte pour ta situation.
            await self.send_private_message({
                "message": message,
                "sender": self.user.username,
                "target_user": target_username  # Utilise le nom d'utilisateur ici uniquement à des fins d'affichage ou de log
            })
        else:
            print(f"User {target_username} not found.")


    async def send_private_message(self, event):
        message = event['message']
        sender = event['sender']
        target_user = event['target_user']
        await self.channel_layer.group_send(
            f"private_chat_{target_user}",
            {
                "type": "chat.message",
                "message": message,
                "sender": sender,
                "target_user": target_user
            }
        )

 
    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        target_user = event['target_user']
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'target_user': target_user
        }))

    @database_sync_to_async
    def save_private_message(self, message, target_user):
        PrivateMessage.objects.create(
            sender=self.user,
            recipient=target_user,
            content=message
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