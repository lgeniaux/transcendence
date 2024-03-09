import pytest
from rest_framework import status

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

    