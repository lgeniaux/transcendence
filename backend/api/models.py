from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField 
from notifications.models import Notification

# Louis: j'ai remove les attributs en doublons avec la classe de base de django
class User(AbstractUser):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    online_status = models.BooleanField(default=False)
    friendlist = models.ManyToManyField('self', blank=True)
    blocklist = models.ManyToManyField('self', blank=True)
    tournaments = models.ManyToManyField('Tournament', blank=True)
    
    # Note de Louis: I didn't add a password field because it is already included in AbstractUser

class Game(models.Model):
    def __str__(self):
        return f"{self.player1} vs {self.player2}"
    
    game_id = models.AutoField(primary_key=True)
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, null=True, blank=True)
    round_name = models.CharField(max_length=50, null=True, blank=True)


class Tournament(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tournaments')
    #participants are a list of inviation notificaitons the creator has sent
    invitations = models.ManyToManyField(Notification, blank=True)
    participants = models.ManyToManyField(User, blank=True) # users that have accepted the invitation
    start_time = models.DateTimeField(auto_now_add=True)
    state = models.JSONField(default=dict)
    
    def initialize_state(self):
        # we know the number of participants can only be 4, 6 or 8, so we can initialize the state accordingly (quarter-finals, semi-finals, finals etc )
        participants = self.participants.all()
        state = {}
        state['quarter-finals'] = []
        state['semi-finals'] = []
        state['finals'] = []
        state['winner'] = None
        state['status'] = 'waiting for all participants to join'
        for i in range(0, len(participants), 2):
            state['quarter-finals'].append({'player1': participants[i].username, 'player2': participants[i+1].username, 'winner': None})
        self.state = state
        self.save()


class TournamentInvitation(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    notification = models.ForeignKey(Notification, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')])
    
class LiveChat(models.Model):
    def __str__(self):
        return f"{self.user} : {self.message}"
    
    chat_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=100)
    time = models.DateTimeField(auto_now_add=True)
