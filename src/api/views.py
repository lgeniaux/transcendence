from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer, UserRegistrationSerializer
from django.contrib.auth import authenticate

# LIST OF ALL API ENDPOINTS

class GameList(APIView):
    """
    List all games
    """
    def get(self, request, format=None):
        games = Game.objects.all()
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)
    
class UserRegistration(APIView):
    """
    Register a new user
    """
    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User successfully registered"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLogin(APIView):
    """
    Login a user
    """
    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            return Response({"message": "User successfully logged in"}, status=status.HTTP_200_OK)
        return Response({"message": "Wrong credentials"}, status=status.HTTP_401_UNAUTHORIZED)