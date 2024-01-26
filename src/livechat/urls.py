from django.urls import path
from .views import chat_view, post_message

urlpatterns = [
    path('', chat_view, name='chat'),
    path('post_message/', post_message, name='post_message'),
]