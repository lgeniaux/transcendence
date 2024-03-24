from rest_framework import serializers
from django.contrib.auth import get_user_model
from api.models import Game, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

class GameStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['game_id', 'status', 'score_player1', 'score_player2', 'winner']

class GetGameStatus(APIView):
    """
    /api/game/get-status/<int:game_id>/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, game_id, format=None):
        try:
            game = Game.objects.get(game_id=game_id)
            serializer = GameStatusSerializer(game)
            return Response(serializer.data)
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
            raise serializers.ValidationError('You are not a player of this game')
        if game.status != 'waiting to start':
            raise serializers.ValidationError('Game already started or waiting for player2')
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
            raise serializers.ValidationError('You are not the Host of this game')
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
            game.status = 'ended'
            game.winner = game.player1 if score[0] > score[1] else game.player2
            game.score_player1 = score[0]
            game.score_player2 = score[1]
            game.save()
            return Response({'message': 'Game ended', 'score_player1': game.score_player1, 'score_player2': game.score_player2, 'winner': game.winner}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)