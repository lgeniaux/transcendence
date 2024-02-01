from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer, UserRegistrationSerializer
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
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError:
                #debug purpose
                print(serializer.errors)
                print(serializer.validated_data)
                return Response({"error": "A user with that username or email already exists."},
                                status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLogin(APIView):
    """
    Login a user
    """
    def post(self, request, format=None):
        print("Login POST request received")
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            return Response({"message": "User successfully logged in"}, status=status.HTTP_200_OK)
        return Response({"message": "Wrong credentials"}, status=status.HTTP_401_UNAUTHORIZED)