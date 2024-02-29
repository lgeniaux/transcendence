from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer, UserRegistrationSerializer, UserLoginSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication

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
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    
class UserLogin(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        User = get_user_model()
        if request.user.is_authenticated:
            return Response({"detail": "You are already authenticated"}, status=status.HTTP_200_OK)
        
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(email=email)  # Note de Louis: j'ai viré la fonction authenticate() car elle demande un username au lieu d'un email
            except User.DoesNotExist:
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if the password is correct
            if user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)
                return Response({"detail": "Success", "auth_token": token.key}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogout(APIView):
    authentication_classes = [TokenAuthentication]
    def post(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            request.user.auth_token.delete()
            return Response({"detail": "You have successfuly been logged out"}, status=status.HTTP_200_OK)
        return Response({"detail": "You are not logged in"}, status=status.HTTP_401_UNAUTHORIZED)