from rest_framework import serializers
from django.contrib.auth import get_user_model
from api.models import Game, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from tournaments.views import broadcast_to_tournament_group
from notifications.models import Notification

class GetGameStatus(APIView):
    """
    /api/game/get-status/<int:game_id>/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id, format=None):
        try:
            game = get_object_or_404(Game, game_id=game_id)
            data = {
                'game_id': game.game_id,
                'player1': game.player1.username,
                'player2': game.player2.username,
                'status': game.status,
                'winner': game.winner.username if game.winner else None,
                'score_player1': game.score_player1,
                'score_player2': game.score_player2,
                'tournament': game.tournament.name if game.tournament else None,
                'round_name': game.round_name if game.round_name else None,
            }
           
            #do not return the response if the request user is not player1 or player2
            if request.user != game.player1 and request.user != game.player2:
                return Response({"detail": "You are not a player of this game."}, status=status.HTTP_400_BAD_REQUEST)
            actual_user_role = 'player1' if game.player1 == request.user else 'player2'
            return Response({'game': data, 'player': actual_user_role}, status=status.HTTP_200_OK)
            
        except Game.DoesNotExist:
            return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)


class StartGameSerializer(serializers.Serializer):
    game_id = serializers.IntegerField()

    def validate(self, data):
        game_id = data.get('game_id')
        user = self.context['request'].user
        game = get_object_or_404(Game, game_id=game_id)

        if not game:
            raise serializers.ValidationError('Game not found')
        if game.player1 != user:
            raise serializers.ValidationError('You are not the host of this game')
        if game.status != 'waiting to start':
            raise serializers.ValidationError('Game already started or waiting for player2')
        # if the game is linked to a tournament brodcast the update to the tournament channel 
        return data
    
class StartGame(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = StartGameSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            game_id = serializer.validated_data['game_id']
            game = Game.objects.filter(game_id=game_id).first()
            game.status = 'in progress'
            game.save()
            if game.tournament:
                tournament = game.tournament
                broadcast_message = {
                    'type': 'game_start',
                    'game_id': game_id,
                    'status': 'in progress',
                    'player1': game.player1.username,
                    'player2': game.player2.username,
                    }
                broadcast_to_tournament_group(tournament.id, broadcast_message)
            return Response({'message': 'Game started'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EndGameSerializer(serializers.Serializer):
    game_id = serializers.IntegerField()
    score = serializers.CharField() # e.g "1-0"

    def validate(self, data):
        game_id = data.get('game_id')
        score = data.get('score')
        user = self.context['request'].user
        game = get_object_or_404(Game, game_id=game_id)

        if not game:
            raise serializers.ValidationError('Game not found')
        if game.player1 != user:
            raise serializers.ValidationError('You are not the host of this game')
        if game.status != 'in progress':
            raise serializers.ValidationError('Game not in progress')
        if game.winner:
            raise serializers.ValidationError('Game already ended')
        if not score:
            raise serializers.ValidationError('Score is required')
        return data
    
    def validate_score(self, value):
        score = value.split('-')
        if len(score) != 2:
            raise serializers.ValidationError('Invalid score format')
        if not score[0].isdigit() or not score[1].isdigit():
            raise serializers.ValidationError('Invalid score format') 
        # one of the two players MUST have a score of 5 to end the game
        if score[0] != '5' and score[1] != '5':
            raise serializers.ValidationError('Invalid score format')
        if int(score[0]) > 5 or int(score[1]) > 5:
            raise serializers.ValidationError('Invalid score format')
        if score[0] == score[1]:
            raise serializers.ValidationError('Draw is not allowed')
        return score
        

class EndGame(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = EndGameSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            game_id = serializer.validated_data['game_id']
            score = serializer.validated_data['score']
            game = Game.objects.filter(game_id=game_id).first()
            game.status = 'finished'
            game.winner = game.player1 if score[0] > score[1] else game.player2
            game.score_player1 = score[0]
            game.score_player2 = score[1]
            game.save()
            #send the game end message to the game channel
            channel_layer = get_channel_layer()
            broadcast_message = {
                'type': 'game.update',
                'message': 'Game has ended'
                }
            async_to_sync(channel_layer.group_send)(f'game_{game_id}', broadcast_message)

            if game.tournament:
                tournament = game.tournament
                broadcast_message = {
                    'type': 'game_end',
                    'game_id': game_id,
                    'status': 'finished',
                    'score_player1': score[0],
                    'score_player2': score[1],
                    'winner': game.winner.username
                    }
                broadcast_to_tournament_group(tournament.id, broadcast_message)
            # change related notifications to finished
            notifications = Notification.objects.filter(data__game_id=game_id)
            for notification in notifications:
                notification.data['status'] = 'finished'
                notification.save()
            return Response({'message': 'Game finished', 'score_player1': game.score_player1, 'score_player2': game.score_player2, 'winner': game.winner.username}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)