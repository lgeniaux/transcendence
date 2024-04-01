export async function loadContent(url, selector)
{
    try
    {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`loadContent failed: ${response.statusText}`);

        const html = await response.text();
        document.querySelector(selector).innerHTML = html;
    }
    catch (error)
    {
        console.error(error);
    }
}

export function getCSRFToken()
{
    let csrfToken = null;

    if (document.cookie && document.cookie !== '')
	{
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++)
		{
            const cookie = cookies[i].trim();

            if (cookie.substring(0, 'csrftoken='.length) === 'csrftoken=')
			{
                csrfToken = decodeURIComponent(cookie.substring('csrftoken='.length));
                break;
            }
        }
    }

    return csrfToken;
}

export function revokeAuthToken()
{
    sessionStorage.removeItem('authToken');
    window.location.href = '/login';
}

export function getRequestHeaders()
{
    const authToken = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (authToken && authToken !== 'undefined' && authToken !== 'null')
        headers['Authorization'] = `Token ${authToken}`;

    return headers;
}

export async function getFileContent(url)
{
    try
	{
        const response = await fetch(url);

        if (!response.ok)
            throw new Error('Failed to load the file.');

        const html = await response.text();

        return html;
    }
	catch (error)
	{
        throw new Error(`Error loading the file from URL ${url}: ${error.message}`);
    }
}

export async function logoutUser()
{
    try
    {
        const response = await fetch('/api/logout-user/', {
            method: 'POST',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (response.ok)
        {
            sessionStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        else
            alert('Failed to logout.');

    }
    catch (error)
    {
        console.error('Error:', error);
    }
}

export function initLogoutButton()
{
    const logoutButton = document.getElementById('logoutBtn');
    const sidePanelLogoutButton = document.getElementById('sidePanelLogoutButton');

    if (logoutButton)
    {
        logoutButton.addEventListener('click', async function() {
            logoutUser();
        });
    }

    if (sidePanelLogoutButton)
    {
        sidePanelLogoutButton.addEventListener('click', async function() {
            logoutUser();
        });
    }
}
