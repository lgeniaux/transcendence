async function loadContent(url, selector, description = '')
{
    try
    {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`Échec du chargement ${description}: ${response.statusText}`);

        const html = await response.text();
        document.querySelector(selector).innerHTML = html;
    }
    catch (error)
    {
        console.error('Erreur lors du chargement du contenu:', error);
    }
}


function getCSRFToken()
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

function revokeAuthToken()
{
    sessionStorage.removeItem('authToken');
    window.location.href = '/login';
}

function getRequestHeaders()
{
    const authToken = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (authToken && authToken !== 'undefined' && authToken !== 'null')
        headers['Authorization'] = `Token ${authToken}`;

    return headers;
}

async function getFileContent(url)
{
    try
	{
        const response = await fetch(url);

        if (!response.ok)
            throw new Error('La requête a échoué.');

        const html = await response.text(); // Extraire le texte de la réponse

        return html; // Retourner le contenu du fichier
    }
	catch (error)
	{
        throw new Error(`Erreur lors du chargement du fichier depuis l'URL ${url}: ${error.message}`);
    }
}



async function logoutUser()
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
            console.error('Failed to logout.');

    }
    catch (error)
    {
        console.error('Error:', error);
    }
}



function initLogoutButton()
{
    const logoutButton = document.getElementById('logoutBtn');
    const sidePanelLogoutButton = document.getElementById('sidePanelLogoutButton');

    if (logoutButton)
    {
        logoutButton.addEventListener('click', function() {
            logoutUser();
        });
    }

    if (sidePanelLogoutButton)
    {
        sidePanelLogoutButton.addEventListener('click', function() {
            logoutUser();
        });
    }
}
