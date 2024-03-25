from django.urls import path
from .views import GameList, UserRegistrationView, UserLogin, UserLogout, UserDelete
from .oauth import CodeForToken
from .profile import UserProfile, ChangePassword
from .social import AddOrDeleteFriend, GetUsersList, BlockOrUnblockUser, GetUserNotifications, ManageInvitationNotification, InvitePlayerToGame
# import notifications.consumers
from notifications import consumers 
from .tournaments import CreateTournament, GetMyTournaments, GetTournamentState, InvitePlayerToTournament
from livechat.views import GetConversationMessages
from games.views import GetGameStatus, StartGame, EndGame
from .stats import GetUserStats

app_name = 'api'

urlpatterns = [
   path('games/', GameList.as_view(), name='game-list'),
   path('register-user/', UserRegistrationView.as_view(), name='register-user'),
   path('login-user/', UserLogin.as_view(), name='login-user'),
   path('logout-user/', UserLogout.as_view(), name='logout-user'),
   path('oauth-code-for-token/', CodeForToken.as_view(), name='oauth-code-for-token'),
   path('me/', UserProfile.as_view(), name='me'),
   path('change-password/', ChangePassword.as_view(), name='change-password'),
   path('me/delete/', UserDelete.as_view(), name='delete-user'),

   #SOCIAL
   path('add-friend/', AddOrDeleteFriend.as_view(), name='add-friend'),
   path('delete-friend/', AddOrDeleteFriend.as_view(), name='delete-friend'),
   path('block-user/', BlockOrUnblockUser.as_view(), name='block-user'),
   path('unblock-user/', BlockOrUnblockUser.as_view(), name='unblock-user'),
   path('get-users/', GetUsersList.as_view(), name='get-users'),

   path('ws/notifications/<str:token>/', consumers.NotificationConsumer.as_asgi()),
   path('tournament/create-tournament/', CreateTournament.as_view(), name='create-tournament'),
   path('tournament/get-tournaments/', GetMyTournaments.as_view(), name='get-tournaments'),
   path('tournament/<int:tournament_id>/state/', GetTournamentState.as_view(), name='get-tournament-state'),
   path('tournament/invite/', InvitePlayerToTournament.as_view(), name='invite-player'),


   path('get-notifications/',  GetUserNotifications.as_view(), name='get-notifications'),
   path('respond-to-invite/', ManageInvitationNotification.as_view(), name='respond-to-invite'),

   path('get-messages/', GetConversationMessages.as_view(), name='get-conversation-messages'),

   path('game/invite/', InvitePlayerToGame.as_view(), name='invite-player'),
   path('game/get-status/<int:game_id>/', GetGameStatus.as_view(), name='get-tournament-state'),
   path('game/start/', StartGame.as_view(), name='start-game'),
   path('game/end/', EndGame.as_view(), name='end-game'),

   path('profile/stats/<str:username>/', GetUserStats.as_view(), name='get-user-stats'),
]