function loadContent(url, targetSelector, contentName)
{
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.querySelector(targetSelector).innerHTML = html;
        })
        .catch(error => console.error(`Erreur lors du chargement de ${contentName} :`, error));
}

function getAuthHeaders()
{
    return {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('authToken')}`
    };
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
