// login.js

// Function to initialize the login form
export async function init()
{
    var loginBtn = document.getElementById('loginBtn');

    if (loginBtn)
    {
        loginBtn.addEventListener('click', function (event) {
            event.preventDefault();
            loginUser();
        });
    }


}

async function loginUser()
{
    const email = document.querySelector('[name="email"]').value;
    const password = document.querySelector('[name="password"]').value;

    document.getElementById('loginAlert').innerHTML = '';

    try
    {
        const response = await fetch('/api/login-user/', {
            method: 'POST',
            credentials: 'include',
            headers: getRequestHeaders(),
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if(data.detail === "Success")
        {
            const auth_token = data.auth_token;
            sessionStorage.setItem('authToken', auth_token);
            window.location.href = '/dashboard';
        }
        else
            alert(detail.message)

    } 
    catch (error)
    {
        console.error('Error:', error);
    }
}

