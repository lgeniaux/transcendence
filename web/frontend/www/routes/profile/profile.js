import { getRequestHeaders } from '../../js/utils.js';

export async function init()
{
    await displayUserProfile();

    var profileFormButton = document.getElementById('profileChangeButton');
    var passwordFormButton = document.getElementById('passwordChangeButton');
    var deleteFormButton = document.getElementById('profileDeleteButton');
    var downloadDataButton = document.getElementById('downloadDataButton');



    if (profileFormButton)
    {
        profileFormButton.addEventListener('click', async function (event) {
            event.preventDefault();
            await updateProfile(event);
        });
    }

    if (passwordFormButton)
    {
        passwordFormButton.addEventListener('click', async function (event) {
            event.preventDefault();
            await changePassword(event);
        });
    }
    if (deleteFormButton)
    {
        deleteFormButton.addEventListener('click', async function (event) {
            event.preventDefault();
            await deleteProfile(event);
        });
    }
    if (downloadDataButton)
    {
        downloadDataButton.addEventListener('click', async function (event) {
            event.preventDefault();
            await downloadData(event);
        });
    }
}

async function downloadData(event)
{
    // display the json text in a container under the button
    try
    {
        const response = await fetch('/api/profile/download-data/', {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        var jsonText = JSON.stringify(data, null, 4);
        var blob = new Blob([jsonText], {type: "application/json"}),
        url = URL.createObjectURL(blob);

        var downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "data.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    catch (error)
    {
        console.error('Error:', error);
    }
}

async function fetchUserProfile()
{
    try {
        const response = await fetch('/api/me/', {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (!response.ok){
            console.error(`HTTP error! status: ${response.status}`);
            return {};
        }
        else
            return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
}

async function displayUserProfile()
{
    try
	{
        const data = await fetchUserProfile();

        document.getElementById('username').innerText = data.username;
        document.getElementById('email').innerText = data.email;

        if (data.is_oauth !== undefined){
            if (data.is_oauth)
            {
                document.querySelector('.profile-password').style.display = 'none';
                document.querySelector('.profile-edit ').style.display = 'none';
            }
            else
                document.querySelector('.profile-password').style.display = 'block';
        }
    }
	catch (error)
	{
        console.error('Error:', error);
    }
}


async function updateProfile(event)
{
    try {
        event.preventDefault();
        var formData = new FormData();

        let username = document.querySelector('[name="username"]').value;
        formData.append('username', username || (await fetchUserProfile()).username);
        let avatar = document.querySelector('[name="avatar"]').files[0];
        if (avatar)
            formData.append('avatar', avatar);

        const response = await fetch('/api/me/', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Authorization': `Token ${sessionStorage.getItem('authToken')}` },
            body: formData
        });

        const data = await response.json();

        if (!response.ok)
            throw new Error(Object.values(data).join(' '));
        else
        {
            alert('Profile updated successfully');
            await displayUserProfile();
        }
    }
    catch (error)
    {
        alert(error);
    }
}

async function changePassword(event)
{
    event.preventDefault();

    let old_password = document.querySelector('[name="old_password"]').value;
    let new_password = document.querySelector('[name="new_password"]').value;
    let confirm_password = document.querySelector('[name="confirm_password"]').value;

    if (new_password !== confirm_password)
	{
        alert('Passwords do not match');
        return;
    }

    try
	{
        const response = await fetch('/api/change-password/', {
            method: 'PUT',
            credentials: 'include',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                old_password: old_password,
                new_password: new_password,
                confirm_new_password: confirm_password
            })
        });

        const data = await response.json();

        if (!response.ok){
            alert(Object.values(data).join(' '))
        } else {
            alert(data.detail);
        }
	}
	catch (error)
	{
		console.error('Error:', error);
	}

}

async function deleteProfile(event)
{
    event.preventDefault();

    if (confirm('Are you sure you want to delete your account?'))
    {
        try
        {
            const response = await fetch('/api/me/delete/', {
                method: 'POST',
                credentials: 'include',
                headers: getRequestHeaders()
            });
        
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (data.non_field_errors || data.error)
            {
                alert(data.non_field_errors || data.error);
            }
            else
            {
                alert('Account deleted successfully');
                sessionStorage.clear();
                window.location.href = '/';
            }
        }
        catch (error)
        {
            console.error('Error:', error);
        }
    }
}

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))