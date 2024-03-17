from django.db import models
from django.conf import settings


class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(default=dict)
    

class GameInvitation(models.Model):
    INVITE_CHOICES = (
        ('duel', 'Duel'),
        ('tournament', 'Tournament'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invitations')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_invitations')
    created_at = models.DateTimeField(auto_now_add=True)
    invite_type = models.CharField(max_length=20, choices=INVITE_CHOICES)
    status = models.CharField(max_length=20, default='pending', choices=STATUS_CHOICES)
    tournament_id = models.PositiveIntegerField(null=True, blank=True)

