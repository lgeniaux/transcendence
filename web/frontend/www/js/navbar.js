import { loadContent, getRequestHeaders, initLogoutButton } from './utils.js';

export async function loadNavbar()
{
    try
    {
        // Charger les composants spécifiques de la navbar
        await loadContent('/frontend/www/html/navbar/sidepanel.html', '#sidePanel', 'barre de navigation');
        await loadContent('/frontend/www/html/navbar/profilemodal.html', '#profileModal', 'bouton de profil');
        await loadUsernameIntoModal();
        initLogoutButton();
    }
    catch (error)
    {
        console.error('Erreur lors du chargement de la navbar :', error);
    }
}

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
