from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Game  # Assuming this import exists
from rest_framework.authentication import TokenAuthentication

class CreateGame(APIView):
    """
    Create a new game with the following characteristics:
    - Can be created by any authenticated user.
    - Should have two players.
    - Can have types: "invite", "tournament_game".
    - Has multiple statuses: "waiting_for_players", "pending", "in_progress", "finished".
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        invite_serializer = CreateGameInviteSerializer(data=request.data, context={'request': request})
        if invite_serializer.is_valid():
            game = self.create_game(invite_serializer.validated_data, request.user)
            return Response(self.format_game_response(game), status=status.HTTP_201_CREATED)
        else:
            return Response(invite_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create_game(self, validated_data, user):
        User = get_user_model()
        player2 = User.objects.get(username=validated_data['player2'])
        game = Game.objects.create(
            player1=user,
            player2=player2,
            type=validated_data['type'],
            status="waiting_for_players"
        )
        game.save()
        return game

    def format_game_response(self, game):
        return {
            "detail": "Game created",
            "game_id": game.game_id,
            "player1": game.player1.username,
            "player2": game.player2.username,
            "type": game.type,
            "status": game.status
        }


class CreateGameInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['player2', 'type']

    def validate(self, data):
        request_user = self.context['request'].user
        player2_username = data['player2']
        self.validate_players(request_user, player2_username)
        self.check_existing_invites(request_user, player2_username)
        return data

    def validate_players(self, user1, user2_username):
        if user1.username == user2_username:
            raise serializers.ValidationError("You can't invite yourself")

        User = get_user_model()
        if not User.objects.filter(username=user2_username).exists():
            raise serializers.ValidationError("This user doesn't exist")

    def check_existing_invites(self, user1, user2_username):
        existing_invites_conditions = [
            Q(player1=user1, player2__username=user2_username, type="invite"),
            Q(player1__username=user2_username, player2=user1, type="invite")
        ]
        if Game.objects.filter(reduce(operator.or_, existing_invites_conditions)).exists():
            raise serializers.ValidationError("An invite already exists between these players")
