// login.js

// Function to initialize the login form
function initLoginForm() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            loginUser();
        });
    }
}

function loginUser() {
    var username = document.querySelector('[name="username"]').value;
    var password = document.querySelector('[name="password"]').value;
    const auth_token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    };2

    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }

    fetch('/api/login-user/', {
        method: 'POST',

        headers: headers,
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
        const auth_token = data.auth_token;
        localStorage.setItem('authToken', auth_token);
        console.log(data.message);
        // Note de Louis: Gerer le cas ou le login est bon ou pas
    })
    .catch(error => console.error('Error:', error));
}

// CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

window.initializeForm('loginForm', initLoginForm);
