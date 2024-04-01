export async function init()
{
    var registerBtn = document.getElementById('registerBtn');

    if (registerBtn)
    {
        registerBtn.addEventListener('click', async function (event) {
            event.preventDefault(); // Prevent default form submission

            if (!checkPassword())
                return;

            await registerUser();
        });
    }
}

function checkPassword()
{
    var password = document.querySelector('[name="password"]').value;
    var password2 = document.querySelector('[name="confirmPassword"]').value;

    if (password !== password2)
    {
        alert('Passwords do not match');
        return false;
    }
    return true;
}



async function registerUser()
{
    try
    {
        var formData = new FormData();
        
        formData.append('username', document.querySelector('[name="username"]').value);
        formData.append('email', document.querySelector('[name="email"]').value);
        formData.append('password', document.querySelector('[name="password"]').value);
        
        var avatar = document.querySelector('[name="avatar"]').files[0];
        
        if (avatar)
            formData.append('avatar', avatar, avatar.name);

        const response = await fetch('/api/register-user/', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (data.detail === "Success")
            window.location.href = '/login';
        else if (Object.keys(data).length > 0){
            var error = '';
            for (var key in data)
            {
                error += key + ': ' + data[key] + '\n';
            }
            alert(error);
        }
        else
            throw new Error('Could not register user');
    }
    catch (error)
    {
        alert(error);
    }
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))