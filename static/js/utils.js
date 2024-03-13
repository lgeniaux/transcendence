function loginUser()
{
    var email = document.querySelector('[name="email"]').value;
    var password = document.querySelector('[name="password"]').value;
    var auth_token = localStorage.getItem('authToken');
    var headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };

    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null')
        headers['Authorization'] = 'Token ' + auth_token;

    // Remove
    document.getElementById('loginAlert').innerHTML = '';

    fetch('/api/login-user/',
	{
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if(data.detail === "Success")
		{
            const auth_token = data.auth_token;
            localStorage.setItem('authToken', auth_token);
			location.reload();
        }
        else
            showLoginError(data.detail);
    })
    .catch(error => console.error('Error:', error));
}

function logout()
{
    return new Promise((resolve, reject) => {
        fetch('/api/logout-user/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
                'Authorization': 'Token ' + localStorage.getItem('authToken')
            }
        })
        .then(response => {
            if (response.ok)
			{
                localStorage.removeItem('authToken');
				location.reload();

                resolve(); // Résoudre la promesse une fois que la déconnexion est confirmée
            }
			else
			{
                console.error('Erreur lors de la déconnexion');
                reject(); // Rejeter la promesse en cas d'erreur de déconnexion
            }
        })
        .catch(error => {
            console.error('Error:', error);
            reject(); // Rejeter la promesse en cas d'erreur de connexion
        });
    });
}

function handleLogoutButtonClick(event)
{
    // Désactiver le bouton de déconnexion pour éviter les clics multiples
    event.target.disabled = true;

    // Empêcher la propagation de l'événement de clic pour éviter la navigation immédiate
    event.stopPropagation();

    // Effectuer la déconnexion
    logout().then(() => {
        // Une fois que la déconnexion est confirmée, naviguer vers la nouvelle page
        let originalPath = event.target.dataset.spa;
        let finalPath = getRedirectPath(originalPath);

        navigate(finalPath);
        window.history.pushState({}, '', finalPath);
    });
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

