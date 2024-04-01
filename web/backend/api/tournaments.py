from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tournament
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, User
from notifications.models import Notification
from notifications.views import send_notification, send_notification_to_user


User = get_user_model()


def invite_participants_to_tournament(
    tournament, participants_usernames, sender_username
):
    for username in participants_usernames:
        if username == sender_username:
            tournament.participants.add(User.objects.get(username=username))
            continue
        try:
            participant = User.objects.get(username=username)
            data = {
                "sender_username": sender_username,
                "tournament_name": tournament.name,
                "tournament_id": tournament.id,
                "status": "pending",
            }
            notification = send_notification(
                recipient=participant,
                message="You have been invited to participate in a tournament.",
                notification_type="tournament-invite",
                data=data,
            )
        except User.DoesNotExist:
            continue


def invite_participant_to_tournament(tournament, participant_username, sender_username):
    try:
        participant = User.objects.get(username=participant_username)

        data = {
            "sender_username": sender_username,
            "tournament_name": tournament.name,
            "tournament_id": tournament.id,
            "status": "pending",
        }
        notification = send_notification(
            recipient=participant,
            message="You have been invited to participate in a tournament.",
            notification_type="tournament-invite",
            data=data,
        )
    except User.DoesNotExist:
        pass


class TournamentSerializer(serializers.ModelSerializer):
    nb_players = serializers.IntegerField()
    name = serializers.CharField(max_length=20)

    class Meta:
        model = Tournament
        fields = ["id", "name", "nb_players"]

    def validate(self, data):
        if data["nb_players"] not in [4, 8, 16]:
            raise serializers.ValidationError(
                "Number of participants must be 4, 8 or 16."
            )
        return data

    def validate_name(self, name):
        if len(name) < 3:
            raise serializers.ValidationError(
                "Name must be at least 3 characters long."
            )
        # Ensure uniqueness is correctly enforced
        existing_tournament = Tournament.objects.filter(name=name).first()
        if existing_tournament and self.instance != existing_tournament:
            raise serializers.ValidationError(
                "Tournament with this name already exists."
            )
        return name

    def create(self, validated_data):
        name = validated_data.pop("name")
        nb_players = validated_data.pop("nb_players")
        # Ensure 'participants_username' is removed from validated_data before creating the Tournament instance
        tournament = Tournament.objects.create(
            name=name, creator=self.context["request"].user, nb_players=nb_players
        )

        tournament.participants.add(self.context["request"].user)
        tournament.initialize_state()

        return tournament


class CreateTournament(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = TournamentSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            name = serializer.validated_data["name"]
            if Tournament.objects.filter(name=name).exists():
                return Response(
                    {"error": "Tournament with this name already exists."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tournament = serializer.save()
            return Response(
                {"tournament_id": tournament.id}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetMyTournaments(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tournaments = Tournament.objects.filter(participants=request.user)
        tournaments = sorted(tournaments, key=lambda x: x.start_time, reverse=True)

        data = []
        for tournament in tournaments:
            data.append(
                {
                    "id": tournament.id,
                    "name": tournament.name,
                    "creator": tournament.creator.username,
                    "state": tournament.state,
                }
            )
        return Response(data, status=status.HTTP_200_OK)


class GetTournamentState(APIView):
    """
    /api/tournament/${tournamentId}/state/
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tournament_id = kwargs["tournament_id"]
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            tournament.update_state()
            # game_to_play is the game id that the user have to play
            game_to_play = None
            if tournament.state["status"] == "in progress":
                game_to_play = tournament.get_game_to_play(request.user)
            return Response(
                {
                    "name": tournament.name,
                    "state": tournament.state,
                    "nb_players": tournament.nb_players,
                    "is_creator": tournament.creator == request.user,
                    "game_to_play": game_to_play,
                },
                status=status.HTTP_200_OK,
            )
        except Tournament.DoesNotExist:
            return Response(
                {"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InvitePlayerToTournamentSerializer(serializers.Serializer):
    tournament_id = serializers.IntegerField()
    username = serializers.CharField(max_length=50)

    def validate(self, data):
        tournament_id = data["tournament_id"]
        tournament = Tournament.objects.get(id=tournament_id)
        if not Tournament.objects.filter(id=tournament_id).exists():
            raise serializers.ValidationError("Tournament not found.")

        if tournament.creator != self.context["request"].user:
            raise serializers.ValidationError(
                "You are not the creator of this tournament."
            )

        # check if number of current participants + current pending inviation + the new invitation is less than max number of participants
        if (
            tournament.participants.count()
            + Notification.objects.filter(
                data__tournament_id=data["tournament_id"],
                notification_type="tournament-invite",
                data__status="pending",
            ).count()
            + 1
            > tournament.nb_players
        ):
            raise serializers.ValidationError(
                "Maximum number of invitations + participants reached."
            )

        # if the user is already a participant in the tournament
        if tournament.participants.filter(username=data["username"]).exists():
            raise serializers.ValidationError(
                "User is already a participant in the tournament."
            )

        # if there is not already a notification for this user on the same tournament
        if Notification.objects.filter(
            recipient__username=data["username"],
            data__tournament_id=tournament_id,
            notification_type="tournament-invite",
        ).exists():
            raise serializers.ValidationError("Invitation already sent.")

        return data

    def validate_username(self, username):
        request_user = self.context["request"].user
        player = User.objects.get(username=username)
        if username == self.context["request"].user.username:
            raise serializers.ValidationError("You cannot invite yourself.")
        if not User.objects.filter(username=username).exists():
            raise serializers.ValidationError("User with this username does not exist.")
        # if the request user is in the blocklist of the user
        if request_user in player.blocklist.all():
            raise serializers.ValidationError("User has blocked you.")
        if player in request_user.blocklist.all():
            raise serializers.ValidationError("You have blocked this user.")
        return username


class InvitePlayerToTournament(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = InvitePlayerToTournamentSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            tournament_id = serializer.validated_data["tournament_id"]
            try:
                tournament = Tournament.objects.get(id=tournament_id)
                invite_participant_to_tournament(
                    tournament,
                    serializer.validated_data["username"],
                    request.user.username,
                )
                return Response(
                    {"message": "Invitation sent."}, status=status.HTTP_200_OK
                )
            except Tournament.DoesNotExist:
                return Response(
                    {"error": "Tournament not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StartTournament(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        tournament_id = kwargs["tournament_id"]
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            if tournament.creator != request.user:
                return Response(
                    {"error": "You are not the creator of this tournament."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if tournament.state != "pending":
                return Response(
                    {"error": "Tournament is not in pending state."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                tournament.start_tournament()
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {"message": "Tournament started."}, status=status.HTTP_200_OK
            )
        except Tournament.DoesNotExist:
            return Response(
                {"error": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND
            )
