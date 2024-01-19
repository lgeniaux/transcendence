from django.urls import path
from .views import GameList, UserRegistrationView, UserLogin

app_name = 'api'

urlpatterns = [
    path('games/', GameList.as_view(), name='game-list'),
    path('register-user/', UserRegistrationView.as_view(), name='register-user'),
    path('login-user/', UserLogin.as_view(), name='login-user'),
]