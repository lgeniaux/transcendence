from django.urls import path
from .views import GameList, UserRegistrationView, UserLogin, UserLogout
from .oauth import CodeForToken
from .profile import UserProfile, ChangePassword
from .games import CreateGame

app_name = 'api'

urlpatterns = [

    path('register-user/', UserRegistrationView.as_view(), name='register-user'),
    path('login-user/', UserLogin.as_view(), name='login-user'),
    path('logout-user/', UserLogout.as_view(), name='logout-user'),
    path('oauth-code-for-token/', CodeForToken.as_view(), name='oauth-code-for-token'),
    path('me/', UserProfile.as_view(), name='me'),
    path('change-password/', ChangePassword.as_view(), name='change-password'),
    
    #GAMES
    path('games/', GameList.as_view(), name='game-list'),
    path('games/create/', CreateGame.as_view(), name='create-game'),
]