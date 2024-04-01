from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.conf import settings
import requests
from django.core.files.base import ContentFile

from django.db import IntegrityError
from django.db.models import Q

class CodeForToken(APIView):
    """
    Get a token for the user
    """

    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        redirect_uri = "https://localhost:8443/oauth_callback"

        if code is None:
            return Response({"detail": "No code provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        token_response = requests.post(
            "https://api.intra.42.fr/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": "u-s4t2ud-4c5c2185a70974ac0cfdefacbe289d7ec81936940b6980d71e752c16ec1c5d17",
                "client_secret": "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",
                "code": code,
                "redirect_uri": redirect_uri,
            },
        )

        if token_response.status_code == 200:
            access_token = token_response.json().get("access_token")

            user_info_response = requests.get(
                "https://api.intra.42.fr/v2/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if user_info_response.status_code == 200:
                user_info = user_info_response.json()
                User = get_user_model()
                
                existing_user = User.objects.filter(Q(email=user_info["email"]) | Q(username=user_info["login"])).first()
                existing_oauth_user = User.objects.filter(Q(email=user_info["email"]) & Q(username=user_info["login"]) & Q(is_oauth=True)).first()
                if existing_oauth_user:
                    token, created = Token.objects.get_or_create(user=existing_oauth_user)
                    if not created:
                        token.delete()
                        token = Token.objects.create(user=existing_oauth_user)
                        return Response({"detail": "Success", "auth_token": token.key}, status=status.HTTP_200_OK)
                    else:
                        return Response({"detail": "Success", "auth_token": token.key}, status=status.HTTP_200_OK)
                elif existing_user:
                    return Response({"detail": "A user with this email or username already exists."}, status=status.HTTP_409_CONFLICT)
                else:
                    avatar_response = requests.get(user_info["image"]["versions"]["small"], stream=True)
                    if avatar_response.status_code == 200:
                        avatar_file = ContentFile(avatar_response.content, name=user_info["login"] + "_avatar.jpg")
                    else:
                        avatar_file = None

                    try:
                        user = User.objects.create(
                            email=user_info["email"],
                            username=user_info["login"],
                            is_oauth=True
                        )

                        if avatar_file:
                            user.avatar.save(user.username + "_avatar.jpg", avatar_file, save=True)

                    except IntegrityError as e:
                        return Response({"detail": "Failed to create user due to a conflict."}, status=status.HTTP_409_CONFLICT)


                    token, _ = Token.objects.get_or_create(user=user)
                    return Response({"detail": "Success", "auth_token": token.key}, status=status.HTTP_200_OK)

        return Response(token_response.json(), status=token_response.status_code)
