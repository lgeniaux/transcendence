// oauth.js

function initOauthHandling() {
    if (window.location.pathname === '/login') {
        document.getElementById('oauthLoginBtn').addEventListener('click', function (event) {
            event.preventDefault();
            redirectTo42OAuth();
        });
    }
    
    if (window.location.pathname === '/oauth_callback') {
        handle42OAuthCallback();
    }
}

function redirectTo42OAuth() {
    const clientId = 'u-s4t2ud-4c5c2185a70974ac0cfdefacbe289d7ec81936940b6980d71e752c16ec1c5d17'; // Louis: c'est normal que le user ai acces a cette information car il est public
    const redirectUri = encodeURIComponent('http://localhost:8000/oauth_callback');
    const scope = 'public';
    const state = generateRandomString();
    const responseType = 'code';

    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

    localStorage.setItem('oauth_state', state);

    // Redirect to the 42 OAuth page
    window.location.href = authUrl;
}

function handle42OAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('oauth_state');

    if (state === storedState) {
        exchangeCodeForToken(code);
    } else {
        console.error('State mismatch');
    }
}

function exchangeCodeForToken(code) {
    fetch('/api/oauth-code-for-token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() 
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.detail === "Success" && data.auth_token) {
            localStorage.setItem('authToken', data.auth_token);
            window.location.href = '/';
        }
        else {
            console.error(data.detail);
        }
    })
    .catch(error => console.error('Error:', error));

}


function generateRandomString(length = 32) {
    let str = '';
    const alphanum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        str += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
    }

    return str;
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
window.initPageFunctions.push(initOauthHandling);
