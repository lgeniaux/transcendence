from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/chat/<str:token>/", consumers.LiveChatConsumer.as_asgi()),
]
