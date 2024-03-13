// profile.js


function initProfilePage() {
    fetchUserProfile();
    var profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            updateProfile(event);
        });
    }
    var passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function (event) {
            event.preventDefault();
            changePassword(event);
        });
    }
}

function fetchUserProfile() {
    var auth_token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };

    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }

    fetch('/api/me/', {
        method: 'GET',
        credentials: 'include',
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('username').innerText = data.username;
        document.getElementById('email').innerText = data.email;
    })
    .catch(error => console.error('Error:', error));
}

function getCSRFToken() {
    let csrfToken = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken='.length) === 'csrftoken=') {
                csrfToken = decodeURIComponent(cookie.substring('csrftoken='.length));
                break;
            }
        }
    }
    return csrfToken;
}

function updateProfile(event) {
    event.preventDefault();
    var username = document.querySelector('[name="username"]').value;
    var email = document.querySelector('[name="email"]').value;
    var avatar = document.querySelector('[name="avatar"]').value;
    const auth_token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };
    
    const body_data = {};
    if (username) {
        body_data.username = username;
    }
    if (email) {
        body_data.email = email;
    }
    if (avatar) {
        body_data.avatar = avatar;
    }
    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }

    fetch('/api/me/', {
        method: 'PUT',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(body_data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Profile updated');
    })
    .catch(error => console.error('Error:', error));
}

function changePassword(event) {
}

window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initProfilePage);


export { getCSRFToken };