from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    online_status = models.BooleanField(default=False)
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

class LiveChat(models.Model):
    def __str__(self):
        return f"{self.user} : {self.message}"
    
    chat_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=100)
    time = models.DateTimeField(auto_now_add=True)