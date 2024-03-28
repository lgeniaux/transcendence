from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.conf import settings
import requests


class CodeForToken(APIView):
    """
    Get a token for the user
    """

    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        redirect_uri = "http://localhost:8000/oauth_callback"

        if code is None:
            return Response(
                {"detail": "No code provided"}, status=status.HTTP_400_BAD_REQUEST
            )
        else:
            token_response = requests.post(
                "https://api.intra.42.fr/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "client_id": "u-s4t2ud-4c5c2185a70974ac0cfdefacbe289d7ec81936940b6980d71e752c16ec1c5d17",  # a changer et mettre dans le .env
                    "client_secret": "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",  # MEGA IMPORTANT DE NE PAS LE METTRE DANS LE CODE
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
                    # Authenticate or create user based on user_info
                    User = get_user_model()
                    user, created = User.objects.get_or_create(
                        email=user_info["email"],
                        defaults={"username": user_info["login"]},
                    )
                    if created:
                        user.is_oauth = True
                        user.save()
                    else:
                        if not user.is_oauth:
                            return Response(
                                {
                                    "detail": "User already exists with this email. Please login using your password."
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                    token, _ = Token.objects.get_or_create(user=user)
                    return Response(
                        {"detail": "Success", "auth_token": token.key},
                        status=status.HTTP_200_OK,
                    )

            return Response(token_response.json(), status=token_response.status_code)
