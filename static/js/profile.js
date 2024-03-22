// profile.js

function initProfilePage()
{
    fetchUserProfile();

    var profileForm = document.getElementById('profileForm');
    var passwordForm = document.getElementById('passwordForm');

    if (profileForm)
	{
        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            updateProfile(event);
        });
    }

    if (passwordForm)
	{
        passwordForm.addEventListener('submit', function (event) {
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
    })
    .catch(error => console.error('Error:', error));
}

function updateProfile(event)
{
    event.preventDefault();

    var username = document.querySelector('[name="username"]').value;
    var email = document.querySelector('[name="email"]').value;
    var avatar = document.querySelector('[name="avatar"]').value;
    const body_data = {};

    if (username)
        body_data.username = username;

    if (email)
        body_data.email = email;

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
        alert('Profile updated');

        window.location.href = '/profile';
    })
    .catch(error => console.error('Error:', error));
}


function changePassword(event) {
}

window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initProfilePage);

