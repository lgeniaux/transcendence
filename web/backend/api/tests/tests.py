import pytest
from rest_framework import status
import json

base_url = 'http://localhost:8000/api'

# ========== LOGIN TESTS ==========

@pytest.mark.django_db
def test_login_invalid(client):
    # Test case 1: Invalid credentials
    response = client.post(base_url + "/login-user/", {"username": "test", "password": "test", "email": "test"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_login_valid(client):
    # Test case 2: Valid credentials
    response = client.post(base_url + "/register-user/", {"email": "validemail@gmail.com", "username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_201_CREATED
    response = client.post(base_url + "/login-user/", {"email": "validemail@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    # Test Token
    assert response.data['detail'] == "Success"

@pytest.mark.django_db
def test_login_utils(client):
    # Test case 3: Valid email and invalid password
    response = client.post(base_url + "/login-user/", {"email": "validemail@gmail.com", "password": "invalidpassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 4: Invalid email and valid password (note: ça n'a aucune chance d'arriver mais pour l'instant on le teste quand même)
    response = client.post(base_url + "/login-user/", {"email": "invalidusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_already_logged_in(client):
    # Test case 5: Already logged in
    response = client.post(base_url + "/register-user/", {"email": "validemail2@gmail.com", "username": "validusername2", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"email": "validemail2@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    token = response.data['auth_token']
    response = client.post(base_url + "/login-user/", {"email": "validemail2@gmail.com", "password": "17ValidPassword@"}, HTTP_AUTHORIZATION='Token ' + token)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['detail'] == "You are already authenticated"




# ========== REGISTER TESTS ==========
    
@pytest.mark.django_db
def test_bad_email(client):
    # Test case 1: Bad email
    response = client.post(base_url + "/register-user/", {"email": "bademail", "username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(base_url + "/register-user/", {"email": "bademail@", "username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(base_url + "/register-user/", {"email": "bademail@.", "username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(base_url + "/register-user/", {"email": "bademail@.com", "username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    response = client.post(base_url + "/register-user/", {"email": "@gmail.com", "username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST

# ========== LOGOUT TESTS ==========

@pytest.mark.django_db
def test_logout(client):
    response = client.post(base_url + "/register-user/", {"email": "validemail2@gmail.com", "username": "validusername2", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"email": "validemail2@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    token = response.data['auth_token']

    # Test case 1: bad token
    response = client.post(base_url + "/logout-user/", HTTP_AUTHORIZATION='Token ' + "badtoken")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 2: good token
    response = client.post(base_url + "/logout-user/", HTTP_AUTHORIZATION='Token ' + token)
    assert response.status_code == status.HTTP_200_OK

    # Test case 3: already logged out
    response = client.post(base_url + "/logout-user/", HTTP_AUTHORIZATION='Token ' + token)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED



# ========== DELETE USER TESTS ==========

@pytest.mark.django_db
def test_delete_user(client):
    response = client.post(base_url + "/register-user/", {"email": "validemail2@gmail.com", "username": "validusername2", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"email": "validemail2@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    token = response.data['auth_token']

    # Test case 1: bad token
    response = client.post(base_url + "/me/delete/", HTTP_AUTHORIZATION=f'Token badtoken')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 2: good token
    response = client.post(base_url + "/me/delete/", HTTP_AUTHORIZATION=f'Token {token}')
    assert response.status_code == status.HTTP_200_OK

    # Test case 3: already deleted
    response = client.post(base_url + "/me/delete/", HTTP_AUTHORIZATION=f'Token {token}')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ========== CHANGE PASSWORD TESTS ==========

@pytest.mark.django_db
def test_change_password(client):
    response = client.post(base_url + "/register-user/", {"email": "validemail2@gmail.com", "username": "validusername2", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"email": "validemail2@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    token = response.data['auth_token']

    # Test case 1: Invalid current password
    response = client.put(base_url + "/change-password/", data=json.dumps({"old_password": "wrongpassword", "new_password": "18ValidPassword@", "confirm_new_password": "18ValidPassword@"}), headers={"Content-Type": "application/json", "Authorization": 'Token ' + token})
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 2: Valid current password
    response = client.put(base_url + "/change-password/", data=json.dumps({"old_password": "17ValidPassword@", "new_password": "18ValidPassword@", "confirm_new_password": "18ValidPassword@"}), headers={"Content-Type": "application/json", "Authorization": 'Token ' + token})
    if response.status_code > 400:
        print(response.json())
    assert response.status_code == status.HTTP_204_NO_CONTENT
    # Test case 3: Already changed password
    response = client.put(base_url + "/change-password/", data=json.dumps({"old_password": "17ValidPassword@", "new_password": "18ValidPassword@", "confirm_new_password": "18ValidPassword@"}), headers={"Content-Type": "application/json", "Authorization": 'Token ' + token})
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 4: Wrong password format
    response = client.put(base_url + "/change-password/", data=json.dumps({"old_password": "18ValidPassword@", "new_password": "wrongpassword", "confirm_new_password": "wrongpassword"}), headers={"Content-Type": "application/json", "Authorization": 'Token ' + token})
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 5: Passwords don't match
    response = client.put(base_url + "/change-password/", data=json.dumps({"old_password": "18ValidPassword@", "new_password": "18ValidPassword@", "confirm_new_password": "18ValidPassword@"}), headers={"Content-Type": "application/json", "Authorization": 'Token ' + token})
    print(response.json())
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    # Test case 6: invalid token
    response = client.put(base_url + "/change-password/", data=json.dumps({"old_password": "18ValidPassword@", "new_password": "18ValidPassword@", "confirm_new_password": "18ValidPassword@"}), headers={"Content-Type": "application/json", "Authorization": 'Token badtoken'})
    print(response.json())
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ========== Game Tests ==========

@pytest.mark.django_db
def test_create_game(client):
    # Create player 1
    response = client.post(base_url + "/register-user/", {"email": "player1@gmail.com", "username": "player1", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"email": "player1@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    player1_token = response.data['auth_token']
    
    # Create player 2
    response = client.post(base_url + "/register-user/", {"email": "player2@gmail.com", "username": "player2", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"email": "player2@gmail.com", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    player2_token = response.data['auth_token']
    
    # Player 1 invites Player 2
    response = client.post(base_url + "/game/invite/", {"username": "player2"}, HTTP_AUTHORIZATION='Token ' + player1_token)
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    
    # Player 2 get notification_id
    response = client.get(base_url + "/get-notifications/", HTTP_AUTHORIZATION='Token ' + player2_token)
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    notification_id = response.json()[0]['id']
    # Player 2 accepte invite
    response = client.post(base_url + "/respond-to-invite/", {"notification_id": notification_id, "action": "accept"}, HTTP_AUTHORIZATION='Token ' + player2_token)
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    
    # Player 1 starts the game
    response = client.post(base_url + "/game/start/", {"game_id": notification_id}, HTTP_AUTHORIZATION='Token ' + player1_token)
    print(response.json())
    assert response.status_code == status.HTTP_200_OK
    
    # Player 1 ends the game with a score
    response = client.post(base_url + "/game/end/", {"game_id": 1, "score": "5-1"}, HTTP_AUTHORIZATION='Token ' + player1_token)
    print(response.json())
    assert response.status_code == status.HTTP_200_OK

    # Player 1 check profile stats
    # response = client.get(base_url + "/profile/stats/player1/", HTTP_AUTHORIZATION='Token ' + player1_token)
    # print(response.json())
    # assert response.status_code == status.HTTP_200_OK
    # assert response.json()['game_stats']['games_played'] == 1
