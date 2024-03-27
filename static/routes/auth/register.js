// register.js

export async function init()
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



async function registerUser() {
    try {
        var formData = new FormData();
        formData.append('username', document.querySelector('[name="username"]').value);
        formData.append('email', document.querySelector('[name="email"]').value);
        formData.append('password', document.querySelector('[name="password"]').value);
        var avatar = document.querySelector('[name="avatar"]').files[0];
        if (avatar) {
            formData.append('avatar', avatar, avatar.name);
        }

        const response = await fetch('/api/register-user/', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        // Rest of the code remains the same
    } catch (error) {
        console.error('Error:', error);
    }
}




function showRegisterError(message)
{
    const alertHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;

    document.getElementById('registerAlert').innerHTML = alertHTML;
}
