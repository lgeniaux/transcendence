from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
	"""
	This class represents a message in the chat.
	
	"""
	content = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)
	author = models.ForeignKey('users.User', on_delete=models.CASCADE)
	
	def __str__(self):
		return f"{self.author.username} - {self.content} ({self.timestamp})"