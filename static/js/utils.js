function loadContent(url, targetSelector, contentName)
{
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.querySelector(targetSelector).innerHTML = html;
        })
        .catch(error => console.error(`Erreur lors du chargement de ${contentName} :`, error));
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

function getAuthHeaders()
{
    return {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': `Token ${localStorage.getItem('authToken')}`
    };
}

function getRequestHeaders()
{
    const authToken = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken() // Assurez-vous que getCSRFToken() est défini et retourne le token CSRF correct.
    };

    // Inclut l'en-tête d'Authorization seulement si authToken existe et est valide.
    if (authToken && authToken !== 'undefined' && authToken !== 'null')
        headers['Authorization'] = `Token ${authToken}`;

    return headers;
}


async function getFileContent(url)
{
    try
	{
        const response = await fetch(url); // Envoyer une requête pour obtenir le contenu du fichier

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
