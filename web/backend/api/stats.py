from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tournament
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, User, Game
from django.db import models
from django.db.models import Q, F, Case, When, Avg
import pdb

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

User = get_user_model()

class GetUserStats(APIView):
    """
    /api/stats/<username>/fetch/
    Returns a JSON containing user stats.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            fetched_user = User.objects.get(username=kwargs['username'])
            # Filter games by status "finished"
            finished_games = Game.objects.filter(
                (Q(player1=fetched_user) | Q(player2=fetched_user)) & Q(status='finished')
            )
            
            user_stats = {
                'tournaments_played': fetched_user.tournaments.filter(state__status='finished').count(),
                'tournaments_won': fetched_user.tournaments.filter(state__winner=fetched_user.username, state__status='finished').count(),
                'tournament_winrate': fetched_user.tournaments.filter(state__status='finished').count() / fetched_user.tournaments.count() * 100 if fetched_user.tournaments.count() > 0 else 0,
                'games_played': finished_games.count(),
                'games_won': finished_games.filter(winner=fetched_user).count(),
                'game_winrate': finished_games.filter(winner=fetched_user).count() / finished_games.count() * 100 if finished_games.count() > 0 else 0,
            }

            # Calculate average scored value
            user_stats['average_scored_value'] = finished_games.annotate(
                score=Case(
                    When(player1=fetched_user, then=F('score_player1')),
                    When(player2=fetched_user, then=F('score_player2')),
                    default=0
                )
            ).aggregate(Avg('score'))['score__avg'] or 0

            # Calculate average opponent score
            user_stats['average_opponent_score'] = finished_games.annotate(
                opponent_score=Case(
                    When(player1=fetched_user, then=F('score_player2')),
                    When(player2=fetched_user, then=F('score_player1')),
                    default=0
                )
            ).aggregate(Avg('opponent_score'))['opponent_score__avg'] or 0

            # Get game history (return, game_id, player1 username, player2 username, winner username, score_player1, score_player2, start_time for each finished game)
            game_history = []
            for game in finished_games:
                game_history.append({
                    'game_id': game.game_id,
                    'player1': game.player1.username,
                    'player2': game.player2.username,
                    'winner': game.winner.username if game.winner else None,
                    'score_player1': game.score_player1,
                    'score_player2': game.score_player2,
                    'start_time': game.start_time,
                    'tournament_id': game.tournament.id if game.tournament else 'None',
                })
            
            # Get tournament history (return, tournament_id, name, creator username, start_time, end_time, winner username, status for each finished tournament)
            tournament_history = []
            for tournament in fetched_user.tournaments.filter(state__status='finished'):
                tournament_history.append({
                    'tournament_id': tournament.id,
                    'name': tournament.name,
                    'start_time': tournament.start_time,
                    'winner': tournament.state['winner'],
                })

            return Response({
                'user_stats': user_stats, 
                'game_history': game_history, 
                'tournament_history': tournament_history
            })

        except User.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)