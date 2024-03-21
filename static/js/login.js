// login.js

// Function to initialize the login form
function initLoginForm() {
    console.log("Before attempting to find loginBtn");
    var loginBtn = document.getElementById('loginBtn');
    console.log("After attempting to find loginBtn:", loginBtn);
    if (loginBtn) {
        loginBtn.addEventListener('click', function (event) {
            event.preventDefault();
            loginUser();
        });
    }
}

function loginUser() {
    var email = document.querySelector('[name="email"]').value;
    var password = document.querySelector('[name="password"]').value;
    var auth_token = sessionStorage.getItem('authToken');
    var headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };

    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }
    // Remove
    document.getElementById('loginAlert').innerHTML = '';

    fetch('/api/login-user/', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if(data.detail === "Success") {
            const auth_token = data.auth_token;
            sessionStorage.setItem('authToken', auth_token);
            window.location.href = '/dashboard';
        }
        else {
            showLoginError(data.detail);
        }
    })
    .catch(error => console.error('Error:', error));
}

function showLoginError(message) {
    const alertHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
    document.getElementById('loginAlert').innerHTML = alertHTML;
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

window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initLoginForm);
    
