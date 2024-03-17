from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework import serializers
from .models import PrivateMessage


class GetConversationMessagesSerializer(serializers.Serializer):
	username = serializers.CharField()
	#message max count is optional
	message_max_count = serializers.IntegerField(required=False)

	def validate_username(self, value):
		if not get_user_model().objects.filter(username=value).exists():
			raise serializers.ValidationError('User does not exist')
		if get_user_model().objects.get(username=value) == self.context['request'].user:
			raise serializers.ValidationError('You do not have a conversation with yourself')
		return value
	
	

class GetConversationMessages(APIView):
	permission_classes = [IsAuthenticated]
	authentication_classes = [TokenAuthentication]

	def get(self, request, *args, **kwargs):
		serializer = GetConversationMessagesSerializer(data=request.query_params, context={'request': request})
		serializer.is_valid(raise_exception=True)
		other_user = get_user_model().objects.get(username=serializer.validated_data['username'])
		messages = PrivateMessage.objects.filter(sender=request.user, recipient=other_user) | PrivateMessage.objects.filter(sender=other_user, recipient=request.user)
		if serializer.validated_data.get('message_max_count'):
			messages = messages.order_by('-timestamp')[:serializer.validated_data['message_max_count']]
		else:
			messages = messages.order_by('-timestamp')
		serialized_messages = [{'sender': message.sender.username, 'recipient': message.recipient.username, 'content': message.content, 'timestamp': message.timestamp} for message in messages]
		return Response(serialized_messages, status=status.HTTP_200_OK)