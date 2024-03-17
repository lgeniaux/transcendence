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
