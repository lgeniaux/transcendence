import pytest
from rest_framework import status

base_url = 'http://localhost:8000/api'

@pytest.mark.django_db
def test_login_invalid(client):
    # Test case 1: Invalid credentials
    response = client.post(base_url + "/login-user/", {"username": "test", "password": "test"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_login_valid(client):
    # Test case 2: Valid credentials
    client.post(base_url + "/register-user/", {"email": "validemail@gmail.com", "username": "validusername", "password": "17ValidPassword@"})
    response = client.post(base_url + "/login-user/", {"username": "validusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_200_OK
    # Test Token
    assert response.data['detail'] == "Success"

@pytest.mark.django_db
def test_login_utils(client):
    # Test case 3: Valid username and invalid password
    response = client.post(base_url + "/login-user/", {"username": "validusername", "password": "invalidpassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # Test case 4: Invalid username and valid password (note: ça n'a aucune chance d'arriver mais pour l'instant on le teste quand même)
    response = client.post(base_url + "/login-user/", {"username": "invalidusername", "password": "17ValidPassword@"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

