import pytest
from rest_framework import status
import json
import inspect

base_url = "https://localhost:8433/api"

# ========== FIXTURES ==========


@pytest.fixture
def created_users(client):
    users = []
    for i in range(1, 4):
        email = f"user{i}@mail.com"
        username = f"user{i}"
        password = f"{i}ValidPassword@"
        r = client.post(
            base_url + "/register-user/",
            {"email": email, "username": username, "password": password},
        )
        assert r.status_code == status.HTTP_201_CREATED
        r = client.post(
            base_url + "/login-user/", {"email": email, "password": password}
        )
        assert r.status_code == status.HTTP_200_OK
        assert r.data["auth_token"] is not None
        users.append(
            {
                "email": email,
                "username": username,
                "password": password,
                "token": r.data["auth_token"],
            }
        )
    return users


@pytest.fixture
def users_with_games(client, created_users):
    user1, user2 = created_users[0], created_users[1]
    user1_token, user2_token = user1["token"], user2["token"]

    r = client.post(
        base_url + "/game/invite/",
        {"username": user2["username"]},
        HTTP_AUTHORIZATION="Token " + user1_token,
    )
    assert r.status_code == status.HTTP_200_OK
    r = client.get(
        base_url + "/get-notifications/", HTTP_AUTHORIZATION="Token " + user2_token
    )
    assert r.status_code == status.HTTP_200_OK
    assert len(r.json()) == 1
    assert r.json()[0]["data"]["status"] == "pending"
    assert isinstance(r.json()[0]["data"]["game_id"], int)
    game_id = r.json()[0]["data"]["game_id"]
    assert isinstance(r.json()[0]["id"], int)
    notification_id = r.json()[0]["id"]
    r = client.post(
        base_url + "/respond-to-invite/",
        {"notification_id": notification_id, "action": "accept"},
        HTTP_AUTHORIZATION="Token " + user2_token,
    )
    assert r.status_code == status.HTTP_200_OK

    return (game_id, created_users)


# ========== LOGIN TESTS ==========


@pytest.mark.django_db
def test_login_invalid(client):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    # Test case 1: Invalid credentials
    response = client.post(
        base_url + "/login-user/",
        {"username": "test", "password": "test", "email": "test"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    print("\n\n::endgroup::")


@pytest.mark.django_db
def test_login_valid(client):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    # Test case 2: Valid credentials
    response = client.post(
        base_url + "/register-user/",
        {
            "email": "validemail@gmail.com",
            "username": "Vusername",
            "password": "17ValidPassword@",
        },
    )
    print(response.json())
    assert response.status_code == status.HTTP_201_CREATED
    response = client.post(
        base_url + "/login-user/",
        {"email": "validemail@gmail.com", "password": "17ValidPassword@"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.data["detail"] == "Success"
    print("\n\n::endgroup::")


@pytest.mark.django_db
def test_login_utils(client):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    # Test case 3: Valid email and invalid password
    response = client.post(
        base_url + "/login-user/",
        {"email": "validemail@gmail.com", "password": "invalidpassword"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 4: Invalid email and valid password
    response = client.post(
        base_url + "/login-user/",
        {"email": "invalidusername", "password": "17ValidPassword@"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 5: Missing email
    response = client.post(base_url + "/login-user/", {"password": "17ValidPassword@"})
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    print("\n\n::endgroup::")


@pytest.mark.django_db
def test_already_logged_in(client):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    # Test case 5: Already logged in
    response = client.post(
        base_url + "/register-user/",
        {
            "email": "validemail2@gmail.com",
            "username": "Vusername2",
            "password": "17ValidPassword@",
        },
    )
    response = client.post(
        base_url + "/login-user/",
        {"email": "validemail2@gmail.com", "password": "17ValidPassword@"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    token = response.data["auth_token"]
    response = client.post(
        base_url + "/login-user/",
        {"email": "validemail2@gmail.com", "password": "17ValidPassword@"},
        HTTP_AUTHORIZATION="Token " + token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.data["detail"] == "You are already authenticated"
    print("\n\n::endgroup::")


# ========== REGISTER TESTS ==========


@pytest.mark.django_db
def test_bad_email(client):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    # Test case 1: Bad email
    response = client.post(
        base_url + "/register-user/",
        {"email": "bademail", "username": "Vusername", "password": "17ValidPassword@"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(
        base_url + "/register-user/",
        {"email": "bademail@", "username": "Vusername", "password": "17ValidPassword@"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(
        base_url + "/register-user/",
        {
            "email": "bademail@.",
            "username": "Vusername",
            "password": "17ValidPassword@",
        },
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(
        base_url + "/register-user/",
        {
            "email": "bademail@.com",
            "username": "Vusername",
            "password": "17ValidPassword@",
        },
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(
        base_url + "/register-user/",
        {
            "email": "@gmail.com",
            "username": "Vusername",
            "password": "17ValidPassword@",
        },
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    print("\n\n::endgroup::")


# ========== LOGOUT TESTS ==========


@pytest.mark.django_db
def test_logout(client, created_users):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    # Test case 1: bad token
    response = client.post(
        base_url + "/logout-user/", HTTP_AUTHORIZATION="Token " + "badtoken"
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 2: good token
    response = client.post(
        base_url + "/logout-user/",
        HTTP_AUTHORIZATION="Token " + created_users[0]["token"],
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Test case 3: already logged out
    response = client.post(
        base_url + "/logout-user/",
        HTTP_AUTHORIZATION="Token " + created_users[0]["token"],
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    print("\n\n::endgroup::")


# ========== DELETE USER TESTS ==========


@pytest.mark.django_db
def test_delete_user_with_game(client, users_with_games):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    game_id, users = users_with_games

    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + users[0]["token"],
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    response = client.post(
        base_url + "/me/delete/",
        HTTP_AUTHORIZATION=f"Token badtoken",
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 2: good token
    response = client.post(
        base_url + "/me/delete/",
        HTTP_AUTHORIZATION=f'Token {users[1]["token"]}',
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Test case 3: login again
    response = client.post(
        base_url + "/login-user/",
        {"email": users[1]["email"], "password": users[1]["password"]},
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 4: already deleted
    response = client.post(
        base_url + "/me/delete/",
        HTTP_AUTHORIZATION=f'Token {users[1]["token"]}',
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Check if the game is deleted
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + users[0]["token"],
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["game"]["status"] == "finished"
    assert response.json()["game"]["winner"] == users[0]["username"]
    assert response.json()["game"]["player1"] == users[0]["username"]
    assert response.json()["game"]["player2"] != users[1]["username"]

    # Reregister the user
    response = client.post(
        base_url + "/register-user/",
        {
            "email": users[1]["email"],
            "username": users[1]["username"],
            "password": users[1]["password"],
        },
    )
    print(response.json())
    assert response.status_code == status.HTTP_201_CREATED

    # Using the token of the deleted user
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + users[1]["token"],
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    print("\n\n::endgroup::")


# ========== CHANGE PASSWORD TESTS ==========


@pytest.mark.django_db
def test_change_password(client, created_users):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    user1 = created_users[0]
    token = user1["token"]
    # Test case 1: Invalid current password
    response = client.put(
        base_url + "/change-password/",
        data=json.dumps(
            {
                "old_password": "wrongpassword",
                "new_password": "18ValidPassword@",
                "confirm_new_password": "18ValidPassword@",
            }
        ),
        headers={"Content-Type": "application/json", "Authorization": "Token " + token},
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 2: Valid current password
    response = client.put(
        base_url + "/change-password/",
        data=json.dumps(
            {
                "old_password": user1["password"],
                "new_password": "18ValidPassword@",
                "confirm_new_password": "18ValidPassword@",
            }
        ),
        headers={"Content-Type": "application/json", "Authorization": "Token " + token},
    )
    if response.status_code != status.HTTP_204_NO_CONTENT:
        print(response.json())
    assert response.status_code == status.HTTP_204_NO_CONTENT
    # Test case 3: Already changed password
    response = client.put(
        base_url + "/change-password/",
        data=json.dumps(
            {
                "old_password": user1["password"],
                "new_password": "18ValidPassword@",
                "confirm_new_password": "18ValidPassword@",
            }
        ),
        headers={"Content-Type": "application/json", "Authorization": "Token " + token},
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 4: Wrong password format
    response = client.put(
        base_url + "/change-password/",
        data=json.dumps(
            {
                "old_password": "18ValidPassword@",
                "new_password": "wrongpassword",
                "confirm_new_password": "wrongpassword",
            }
        ),
        headers={"Content-Type": "application/json", "Authorization": "Token " + token},
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 5: Passwords don't match
    response = client.put(
        base_url + "/change-password/",
        data=json.dumps(
            {
                "old_password": "18ValidPassword@",
                "new_password": "18ValidPassword@",
                "confirm_new_password": "18ValidPassword@",
            }
        ),
        headers={"Content-Type": "application/json", "Authorization": "Token " + token},
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 6: invalid token
    response = client.put(
        base_url + "/change-password/",
        data=json.dumps(
            {
                "old_password": "18ValidPassword@",
                "new_password": "18ValidPassword@",
                "confirm_new_password": "18ValidPassword@",
            }
        ),
        headers={"Content-Type": "application/json", "Authorization": "Token badtoken"},
    )
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    print("\n\n::endgroup::")


# ========== Game Tests ==========


@pytest.mark.django_db
def test_create_game(client, created_users):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    user1, user2, user3 = created_users[0], created_users[1], created_users[2]
    player1_token, player2_token, player3_token = (
        user1["token"],
        user2["token"],
        user3["token"],
    )

    # Player 1 invites Player 2
    response = client.post(
        base_url + "/game/invite/",
        {"username": user2["username"]},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 1 invites unknown player
    response = client.post(
        base_url + "/game/invite/",
        {"username": "unknown"},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 1 invites himself
    response = client.post(
        base_url + "/game/invite/",
        {"username": user1["username"]},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 1 invites Player 2 again
    response = client.post(
        base_url + "/game/invite/",
        {"username": user2["username"]},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 invite player 1
    response = client.post(
        base_url + "/game/invite/",
        {"username": user1["username"]},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 get notification_id
    response = client.get(
        base_url + "/get-notifications/", HTTP_AUTHORIZATION="Token " + player2_token
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 1
    assert response.json()[0]["data"]["status"] == "pending"
    assert isinstance(response.json()[0]["data"]["game_id"], int)
    notification_id = response.json()[0]["id"]

    # Player 2 accepte invite
    response = client.post(
        base_url + "/respond-to-invite/",
        {"notification_id": notification_id, "action": "accept"},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 2 accepte invite already accepted
    response = client.post(
        base_url + "/respond-to-invite/",
        {"notification_id": notification_id, "action": "accept"},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 3 invites player 2
    response = client.post(
        base_url + "/game/invite/",
        {"username": user2["username"]},
        HTTP_AUTHORIZATION="Token " + player3_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 2 get notification_id
    response = client.get(
        base_url + "/get-notifications/", HTTP_AUTHORIZATION="Token " + player2_token
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) == 2
    assert response.json()[1]["data"]["status"] == "pending"
    assert isinstance(response.json()[1]["data"]["game_id"], int)
    notification_id = response.json()[1]["id"]

    # Player 2 random action on invite
    response = client.post(
        base_url + "/respond-to-invite/",
        {"notification_id": notification_id, "action": "random"},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 refuse invite
    response = client.post(
        base_url + "/respond-to-invite/",
        {"notification_id": notification_id, "action": "deny"},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 2 accepte invite already refused
    response = client.post(
        base_url + "/respond-to-invite/",
        {"notification_id": notification_id, "action": "accept"},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    print("\n\n::endgroup::")


@pytest.mark.django_db
def test_game(client, users_with_games):
    print(f"::group::{inspect.currentframe().f_code.co_name}")
    game_id, users = users_with_games
    player1_token = users[0]["token"]
    player2_token = users[1]["token"]

    # Player 1 get-status
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["game"]["status"] == "waiting to start"

    # Player 2 get-status
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["game"]["status"] == "waiting to start"

    # Player 3 get-status
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + users[2]["token"],
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 starts the game
    response = client.post(
        base_url + "/game/start/",
        {"game_id": game_id},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 1 starts the game
    response = client.post(
        base_url + "/game/start/",
        {"game_id": game_id},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 1 starts the game again
    response = client.post(
        base_url + "/game/start/",
        {"game_id": game_id},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 starts the game again
    response = client.post(
        base_url + "/game/start/",
        {"game_id": game_id},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 1 get-status
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["game"]["status"] == "in progress"

    # Player 1 check profile stats
    response = client.get(
        base_url + f"/stats/{users[0]['username']}/fetch/",
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["user_stats"]["games_played"] == 0

    # Player 1 ends the game with bad score
    response = client.post(
        base_url + "/game/end/",
        {"game_id": game_id, "score": "5_"},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(
        base_url + "/game/end/",
        {"game_id": game_id, "score": "-1-5"},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(
        base_url + "/game/end/",
        {"game_id": game_id, "score": "-5"},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 ends the game
    response = client.post(
        base_url + "/game/end/",
        {"game_id": game_id, "score": "5-1"},
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 1 ends the game with good score
    response = client.post(
        base_url + "/game/end/",
        {"game_id": game_id, "score": "5-1"},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 1 ends the game again
    response = client.post(
        base_url + "/game/end/",
        {"game_id": game_id, "score": "1-5"},
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    # Player 2 get-status
    response = client.get(
        base_url + f"/game/get-status/{game_id}/",
        HTTP_AUTHORIZATION="Token " + player2_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["game"]["status"] == "finished"

    # Player 1 check profile stats
    response = client.get(
        base_url + f"/stats/{users[0]['username']}/fetch/",
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["user_stats"]["games_played"] == 1
    assert response.json()["user_stats"]["games_won"] == 1

    # Player 1 check profile stats of player 2
    response = client.get(
        base_url + f"/stats/{users[1]['username']}/fetch/",
        HTTP_AUTHORIZATION="Token " + player1_token,
    )
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["user_stats"]["games_played"] == 1
    assert response.json()["user_stats"]["games_won"] == 0
    print("\n\n::endgroup::")
