async function loadUsernameIntoModal()
{
    try
	{
        const response = await fetch('/api/me/', {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (!response.ok)
            throw new Error('Failed to fetch user profile');

        const data = await response.json(); // Parse la réponse JSON

        // Met à jour l'élément avec l'ID `modal-username` avec le username de l'utilisateur
        const modalUsernameElement = document.getElementById('modal-username');

        if (modalUsernameElement)
            modalUsernameElement.innerText = data.username;
    }
	catch (error)
	{
        console.error('Error loading username into modal:', error);
    }
}
