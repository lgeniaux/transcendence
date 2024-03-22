// ----------- backend ----------- //

async function loadChatbox()
{
    try
    {
        await loadContent('/static/html/chatbox/chatbox.html', '#chatBox', 'chatbox');
        initChatbox();
    }
    catch (error)
    {
        console.error('Erreur lors du chargement de la chatbox :', error);
    }
}

function initChatbox()
{
    const auth_token = sessionStorage.getItem('authToken');
    const wsUrl = `ws://${window.location.host}/ws/chat/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);
    
    webSocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Live message:', message);
        displayMessage(message.message);
    };
    
    webSocket.onopen = function() {
        console.log('WebSocket opened');
    };

    webSocket.onclose = function() {
        console.log('WebSocket closed');
    };

    webSocket.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    observeForm(webSocket); // Nouvelle fonction pour observer le formulaire
}

// Afin de ne pas rater le formulaire lorsqu'il est ajouté dynamiquement, nous allons observer le document entier.
function observeForm(webSocket)
{
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList")
			{
                const form = document.getElementById('form');

				// Si le formulaire est trouvé...
                if (form)
				{
                    attachFormSubmitListener(webSocket); // On récupère le formulaire et on attache l'écouteur.
                    observer.disconnect(); // Arrêtez d'observer une fois le formulaire trouvé et l'écouteur attaché.
                }
            }
        });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config); // Commencez à observer le document entier.
}


function attachFormSubmitListener(webSocket)
{
    const form = document.getElementById('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();

        if (message && webSocket.readyState === WebSocket.OPEN)
		{
            webSocket.send(JSON.stringify({ message: message }));
            messageInput.value = ''; // Clear the input after sending
        }
    });
}

function displayMessage(message)
{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    document.getElementById('messages').appendChild(messageElement);
}

// ----------- frontend ----------- //

document.addEventListener('userStatusChange', async (event) => {
    const { username, newStatus } = event.detail;
    // Vous pourriez avoir besoin de récupérer à nouveau les données de l'utilisateur ici
    // Pour l'exemple, on va simplement rafraîchir toute la liste d'amis
    await loadFriendList();
});

async function loadFriendList()
{
    try
    {
        const users = await cb_fetchAllUsers();
        cb_displayUsers(users);
    }
    catch (error)
    {
        // Gère les erreurs potentielles survenues lors de la récupération ou l'affichage des utilisateurs
        console.error("Une erreur s'est produite lors du chargement des amis :", error);
    }
}


async function cb_fetchAllUsers()
{
    try
    {
        const response = await fetch('/api/get-users/', {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (!response.ok)
            throw new Error('Erreur lors de la récupération des utilisateurs');

        const data = await response.json();

        return data;
    }
    catch (error)
    {
        throw error; // L'erreur est renvoyée pour être gérée par l'appelant
    }
}


async function cb_displayUsers(users)
{
    try
	{
        const templateContent = await getFileContent('static/html/chatbox/friendlist.html');
        var usersList = document.getElementById('chatboxContainer');

        usersList.innerHTML = '';

        if (templateContent)
		{
            if (users.length === 0)
                usersList.innerHTML = "<p>Aucun ami pour le moment</p>";
            else
			{
                users.forEach(user => {
                    var actionContainerId = `actions-${user.username}`;
                    var avatar = user.avatar ? user.avatar : 'static/img/person-fill.svg';
                    var userHTML = templateContent
						.replace('{{actionButtons}}', getChatboxActionButtonsHtml(user))
						.replace('{{avatar}}', avatar)
						.replace('{{username}}', user.username)
                        .replace('{{actionContainerId}}', actionContainerId);

                    usersList.innerHTML += userHTML;
                });
            }
        }
		else
            console.error('Le chargement du fichier de modèle a échoué.');
    }
	catch (error)
	{
        console.error('Une erreur s\'est produite lors du chargement et de l\'affichage des amis :', error);
    }
}

function getChatboxActionButtonsHtml(user)
{
    let buttonsHtml = '';

    if (user.status === 'friends')
	{
        // Les utilisateurs qui sont déjà amis
        buttonsHtml += `<a class="dropdown-item" id="messages" onclick="sendMessage('${user.username}')">Envoyer un message</a>`;
        buttonsHtml += `<a class="dropdown-item" id="seeProfile" onclick="viewProfile('${user.username}')">Voir le profil</a>`;
		buttonsHtml += `<hr>`
        buttonsHtml += `<a class="dropdown-item dangerBtn" onclick="deleteFriend('${user.username}')">Supprimer</a>`;
    }
	else if
	(user.status === 'blocked')
	{
        // Les utilisateurs qui sont bloqués
        buttonsHtml += `<a class="dropdown-item dangerBtn" onclick="unblockUser('${user.username}')">Débloquer</a>`;
    }
	else
	{
        // Tous les autres cas, y compris ceux où l'utilisateur peut être ajouté en ami
        buttonsHtml += `<a class="dropdown-item" onclick="addFriend('${user.username}')">Ajouter en ami</a>`;
        buttonsHtml += `<a class="dropdown-item dangerBtn" onclick="blockUser('${user.username}')">Bloquer</a>`;
    }

    return buttonsHtml;
}

function sendMessage()
{
	const messagesUrl = '/static/html/chatbox/messagebox.html';
    loadContent(messagesUrl, '#chatboxContainer', messages);

	// To do...
}

// On ajoute initChatbox à window.initPageFunctions pour qu'il soit appelé lors de l'initialisation de la page.
// window.initPageFunctions = window.initPageFunctions || [];
// window.initPageFunctions.push(initChatbox);
