import { getRequestHeaders } from '../../js/utils.js';

export async function init()
{
    if (window.location.pathname === '/login')
    {
        const oauthLoginBtn = document.getElementById('oauthLoginBtn');

        if (oauthLoginBtn)
        {
            oauthLoginBtn.addEventListener('click', function (event) {
                event.preventDefault();
                redirectTo42OAuth();
            });
        }
    }
    
    if (window.location.pathname === '/oauth_callback')
        handle42OAuthCallback();
}

function redirectTo42OAuth()
{
    const clientId = 'u-s4t2ud-4c5c2185a70974ac0cfdefacbe289d7ec81936940b6980d71e752c16ec1c5d17'; // Louis: c'est normal que le user ai acces a cette information car il est public
    const redirectUri = encodeURIComponent('https://localhost:8443/oauth_callback');
    const scope = 'public';
    const state = generateRandomString();
    const responseType = 'code';

    const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

    sessionStorage.setItem('oauth_state', state);

    window.location.href = authUrl;
}

function handle42OAuthCallback()
{
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');

    if (state === storedState)
    {
        sessionStorage.removeItem('oauth_state');
        exchangeCodeForToken(code);
    } 
    else
    {
        alert('State mismatch');
        const state = sessionStorage.getItem('oauth_state');
        if (state)
            sessionStorage.removeItem('oauth_state');
        window.location.href = '/login';
    }
}

async function exchangeCodeForToken(code)
{
    try
    {
        const response = await fetch('/api/oauth-code-for-token/', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ code: code })
        });

        const data = await response.json();

        if (data.detail === "Success" && data.auth_token)
        {
            sessionStorage.setItem('authToken', data.auth_token);
            window.location.href = '/';
        }
        else
        {
            alert('Error: ' + data.detail);
            const state = sessionStorage.getItem('oauth_state');
            if (state)
                sessionStorage.removeItem('oauth_state');
            window.location.href = '/login';
        }
 
    }
    catch (error)
    {
        alert('Error: ' + error);
    }
}

function generateRandomString(length = 32)
{
    let str = '';
    const alphanum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++)
        str += alphanum.charAt(Math.floor(Math.random() * alphanum.length));

    return str;
}
