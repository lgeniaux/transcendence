from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .serializers import GameSerializer, UserRegistrationSerializer, UserLoginSerializer
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework import serializers
from .serializers import UserSerializer