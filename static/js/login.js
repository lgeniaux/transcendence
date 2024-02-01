// login.js

// Function to initialize the login form
function initLoginForm() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            loginUser();
        });
    }
}

function loginUser() {
    var username = document.querySelector('[name="username"]').value;
    var password = document.querySelector('[name="password"]').value;

    fetch('/api/login-user/', { // Update with the correct URL to your API endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token from cookie
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => response.json())
    .then(data => {
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
