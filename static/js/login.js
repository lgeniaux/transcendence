// login.js

    // Function to initialize the login form
    function initLoginForm() {
        
        console.log("Before attempting to find loginForm");
        var loginForm = document.getElementById('loginForm');
        console.log("After attempting to find loginForm:", loginForm);
        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                loginUser();
            });
        }
    }

    function loginUser() {
        var email = document.querySelector('[name="email"]').value;
        var password = document.querySelector('[name="password"]').value;
        const auth_token = localStorage.getItem('authToken');

        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        };

        if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
            headers['Authorization'] = 'Token ' + auth_token;
        }

        fetch('/api/login-user/', {
            method: 'POST',
            credentials: 'include', // Needed for cookies to be sent with the request
            headers: headers,
            body: JSON.stringify({ email: email, password: password })
        })
            .then(response => response.json())
            .then(data => {
                if(data.detail === "Success") {
                    const auth_token = data.auth_token;
                    localStorage.setItem('authToken', auth_token);
                    console.log(data.message);
                    // Handle login success or failure here
                }
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



window.initPage = initLoginForm;
