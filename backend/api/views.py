from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer, UserRegistrationSerializer, UserLoginSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, csrf_exempt
# LIST OF ALL API ENDPOINTS

class GameList(APIView):
    """
    List all games
    """
    permission_classes = [IsAuthenticated] #this will make sure that the user is authenticated before accessing the endpoint
    def get(self, request, format=None):
        games = Game.objects.all()
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)
    
class UserRegistrationView(APIView):
    """
    Register a new user
    """
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid(): #Note de Louis: is_valid will check all functions that starts with validate_*
            user = serializer.save()
            return Response({"message": "User successfully registered"}, status=status.HTTP_201_CREATED)
        else:
            print(f"Error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    
class UserLogin(APIView):
    """
    Login a user
    """
    def post(self, request, format=None):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token = serializer.create(serializer.validated_data)
            return Response(UserLoginSerializer(user).data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        