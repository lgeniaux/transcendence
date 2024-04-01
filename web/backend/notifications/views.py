from django.utils import timezone
from .models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def send_notification(recipient, message, notification_type, data=None):
    if data is None:
        data = {}
    notification = Notification.objects.create(
        recipient=recipient,
        message=message,
        notification_type=notification_type,
        created_at=timezone.now(),
        data=data,
    )
    send_notification_to_user(notification)


def send_notification_to_user(notification):
    channel_layer = get_channel_layer()
    group_name = f"user_notifications_{notification.recipient.id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "notify",
            "data": {
                "id": notification.id,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "created_at": notification.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "data": notification.data,
            },
        },
    )
