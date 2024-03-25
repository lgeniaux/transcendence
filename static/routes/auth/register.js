// register.js

function checkPassword()
{
    var password = document.querySelector('[name="password"]').value;
    var password2 = document.querySelector('[name="confirmPassword"]').value;

    if (password !== password2)
    {
        console.log('Passwords do not match');
        return false;
    }
    console.log('Passwords match');
    return true;
}

function initRegisterForm()
{
    var registerBtn = document.getElementById('registerBtn');

    if (registerBtn)
    {
        registerBtn.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default form submission

            if (!checkPassword())
                return;

            registerUser();
        });
    }
}

async function registerUser()
{
    try
    {
        var username = document.querySelector('[name="username"]').value;
        var email = document.querySelector('[name="email"]').value;
        var password = document.querySelector('[name="password"]').value;

        const response = await fetch('/api/register-user/', {
            method: 'POST',
            credentials: 'include',
            headers: getRequestHeaders(),
            body: JSON.stringify({ username: username, email: email, password: password })
        });

        const data = await response.json();

        if (data.detail === "Success")
            window.location.href = '/login';
        else
        {
            for (const [key, value] of Object.entries(data))
                showRegisterError(`${key}: ${value}`);
        }
    }
    catch (error)
    {
        console.error('Error:', error);
    }
}



function showRegisterError(message)
{
    const alertHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;

    document.getElementById('registerAlert').innerHTML = alertHTML;
}

window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initRegisterForm);
