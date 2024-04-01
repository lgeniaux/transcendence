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

User = get_user_model()

class GetUserStats(APIView):
    """
    /api/stats/<username>/fetch/
    Returns a JSON containing user stats.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            if kwargs['username'] == 'me':
                fetched_user = request.user
            else:
                fetched_user = User.objects.get(username=kwargs['username'])
                
            finished_games = Game.objects.filter(
                (Q(player1=fetched_user) | Q(player2=fetched_user)) & Q(status='finished')
            )
            
            finished_tournaments = Tournament.objects.filter(participants=fetched_user, state__status='finished')
            user_stats = {
                'tournaments_played': finished_tournaments.count(),
                'tournaments_won': finished_tournaments.filter(state__winner=fetched_user.username).count(),
                'tournament_winrate': finished_tournaments.filter(state__winner=fetched_user.username).count() / finished_tournaments.count() * 100 if finished_tournaments.count() > 0 else 0,
                'games_played': finished_games.count(),
                'games_won': finished_games.filter(winner=fetched_user).count(),
                'game_winrate': finished_games.filter(winner=fetched_user).count() / finished_games.count() * 100 if finished_games.count() > 0 else 0,
            }

            user_stats['average_scored_value'] = finished_games.annotate(
                score=Case(
                    When(player1=fetched_user, then=F('score_player1')),
                    When(player2=fetched_user, then=F('score_player2')),
                    default=0
                )
            ).aggregate(Avg('score'))['score__avg'] or 0

            user_stats['average_opponent_score'] = finished_games.annotate(
                opponent_score=Case(
                    When(player1=fetched_user, then=F('score_player2')),
                    When(player2=fetched_user, then=F('score_player1')),
                    default=0
                )
            ).aggregate(Avg('opponent_score'))['opponent_score__avg'] or 0

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
            
            tournament_history = []
            # filter tournaments where the user is in "participants" array and the tournament is finished
            for tournament in Tournament.objects.filter(participants=fetched_user, state__status='finished'):
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