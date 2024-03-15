from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Notification
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token_key = self.scope['url_route']['kwargs']['token']
        self.user = await self.get_user(token_key)
        
        if self.user:
            group_name = f'user_notifications_{self.user.id}'
            await self.channel_layer.group_add(
                group_name,
                self.channel_name
            )
            await self.accept()
            await self.send_notifications()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            group_name = f'user_notifications_{self.user.id}'
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
        
    @database_sync_to_async
    def get_notifications(self):
        return list(self.user.notifications.values('id', 'message', 'notification_type', 'created_at'))

    async def send_notifications(self):
        notifications = await self.get_notifications()
        await self.send(text_data=json.dumps({
            'type': 'notifications',
            'data': notifications
        }))

    async def send_notification(self, notification_id):
        try:
            notification = await database_sync_to_async(Notification.objects.get)(id=notification_id)
            message = {
                'type': 'notification',
                'data': {
                    'id': notification.id,
                    'message': notification.message,
                    'notification_type': notification.notification_type,
                    'created_at': notification.created_at.isoformat(),
                }
            }
            await self.send(text_data=json.dumps(message))
        except Notification.DoesNotExist:
            pass

    async def notify(self, event):
        # Forward the structured data to the client
        await self.send(text_data=json.dumps(event['data']))