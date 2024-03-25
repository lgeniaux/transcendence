from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tournament
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, User, Game
from django.db import models


# class User(AbstractUser):
#     username = models.CharField(max_length=50, unique=True)
#     email = models.EmailField(max_length=254, unique=True)
#     avatar = models.ImageField(upload_to='avatars/', default="avatars/zippy.jpg", blank=True)
#     online_status = models.BooleanField(default=False)
#     friendlist = models.ManyToManyField('self', blank=True)
#     blocklist = models.ManyToManyField('self', blank=True)
#     tournaments = models.ManyToManyField('Tournament', blank=True)
#     is_oauth = models.BooleanField(default=False)
    
#     def in_active_game(self):
#         return Game.objects.filter(models.Q(player1=self) | models.Q(player2=self)).filter(status='in progress').exists()
    

# class Game(models.Model):
#     def __str__(self):
#         return f"{self.player1} vs {self.player2}"
    
#     game_id = models.AutoField(primary_key=True)
#     player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
#     player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
#     score_player1 = models.IntegerField(default=0)
#     score_player2 = models.IntegerField(default=0)
#     winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner', null=True, blank=True)
#     start_time = models.DateTimeField(auto_now_add=True)
#     end_time = models.DateTimeField(null=True, blank=True)
#     tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, null=True, blank=True)
#     round_name = models.CharField(max_length=50, null=True, blank=True)
#     status = models.CharField(max_length=50, default="waiting for player2")

# class Tournament(models.Model):
#     id = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=50, unique=True)
#     creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tournaments')
#     #participants are a list of inviation notificaitons the creator has sent
#     invitations = models.ManyToManyField(Notification, blank=True)
#     participants = models.ManyToManyField(User, blank=True) # users that have accepted the invitation
#     start_time = models.DateTimeField(auto_now_add=True)
#     state = models.JSONField(default=dict)
#     nb_players = models.IntegerField()
    
#     def initialize_state(self):
#         state = {}
#         state['quarter-finals'] = []
#         state['semi-finals'] = []
#         state['finals'] = []
#         state['winner'] = None
#         state['status'] = 'waiting for all participants to join'
#         self.state = state
#         self.save()

class GetUserStats(APIView):
    """
    /api/profile/stats/<str:username>
    Returns all game played by the user, list of tournaments finished, data containing the number of wins, losses, and the number of games played; the number of tournaments won, lost, and the number of tournaments played; 
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        #finished games
        games = Game.objects.filter(models.Q(player1=user) | models.Q(player2=user)).filter(status='finished')
        games_data = []
        for game in games:
            games_data.append({
                'game_id': game.game_id,
                'player1': game.player1.username,
                'player2': game.player2.username,
                'score_player1': game.score_player1,
                'score_player2': game.score_player2,
                'winner': game.winner.username,
                'start_time': game.start_time,
                'end_time': game.end_time,
                'tournament': game.tournament.name,
                'round_name': game.round_name,
            })
        #finished tournaments
        tournaments = Tournament.objects.filter(participants=user).filter(state__status='finished')
        tournaments_data = []
        for tournament in tournaments:
            tournaments_data.append({
                'id': tournament.id,
                'name': tournament.name,
                'state': tournament.state,
            })

        #stats
        game_stats = {
            'wins': games.filter(winner=user).count(),
            'losses': games.exclude(winner=user).count(),
            'games_played': games.count(),
        }

        tournament_stats = {
            'wins': tournaments.filter(state__winner=user.id).count(),
            'losses': tournaments.exclude(state__winner=user.id).count(),
            'tournaments_played': tournaments.count(),
        }

        return Response({'games': games_data, 'tournaments': tournaments_data, 'game_stats': game_stats, 'tournament_stats': tournament_stats}, status=status.HTTP_200_OK)
    





