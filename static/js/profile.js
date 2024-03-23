// profile.js

function initProfilePage()
{
    fetchUserProfile();

    var profileFormButton = document.getElementById('profileChangeButton');
    var passwordFormButton = document.getElementById('passwordChangeButton');
    if (profileFormButton)
    {
        profileFormButton.addEventListener('click', function (event) {
            event.preventDefault();
            updateProfile(event);
        });
    }

    if (passwordFormButton)
    {
        passwordFormButton.addEventListener('click', function (event) {
            event.preventDefault();
            changePassword(event);
        });
    }
}

function fetchUserProfile()
{
    fetch('/api/me/', {
        method: 'GET',
        credentials: 'include',
        headers: getRequestHeaders()
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').innerText = data.username;
        document.getElementById('email').innerText = data.email;
        if (data.is_oauth)
            document.querySelector('.profile-password').style.display = 'none';
        else
            document.querySelector('.profile-password').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
}

function updateProfile(event)
{
    event.preventDefault();

    var username = document.querySelector('[name="username"]').value;
    var avatar = document.querySelector('[name="avatar"]').value;
    const body_data = {};

    if (username)
        body_data.username = username;

    if (avatar)
        body_data.avatar = avatar;


    fetch('/api/me/', {
        method: 'PUT',
        credentials: 'include',
        headers: getRequestHeaders(), // Utilisation de getRequestHeaders() ici
        body: JSON.stringify(body_data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.non_field_errors || data.error)
        {
            alert(data.non_field_errors || data.error);
        }
        else
            fetchUserProfile();
    })
    .catch(error => console.error('Error:', error));
}


function changePassword(event) {
    event.preventDefault();

    var old_password = document.querySelector('[name="old_password"]');
    var new_password = document.querySelector('[name="new_password"]');
    var confirm_password = document.querySelector('[name="confirm_password"]');
    if (old_password && new_password && confirm_password) {
        old_password = old_password.value;
        new_password = new_password.value;
        confirm_password = confirm_password.value;
    } else {
        alert('Please fill in all password fields');
        return;
    }

    if (new_password !== confirm_password)
    {
        alert('Passwords do not match');
        return;
    }

    fetch('/api/change-password/', {
        method: 'PUT',
        credentials: 'include',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            old_password: old_password,
            new_password: new_password,
            confirm_new_password: confirm_password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.non_field_errors || data.error)
        {
            alert(data.non_field_errors || data.error);
        }
        else
            alert('Password changed successfully');
    })
    .catch(error => console.error('Error:', error));

}

window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initProfilePage);

