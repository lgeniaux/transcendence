// ----------- backend ----------- //

function initChatbox() {
    const auth_token = localStorage.getItem('authToken');
    const wsUrl = `ws://${window.location.host}/ws/chat/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);
    
    webSocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Live message:', message);
        displayMessage(message.message);
    };
    
    webSocket.onopen = function() {
        console.log('WebSocket opened');
        attachFormSubmitListener(webSocket);
    };

    webSocket.onclose = function() {
        console.log('WebSocket closed');
    };

    webSocket.onerror = function(event) {
        console.error('WebSocket error:', event);
    };
}

function attachFormSubmitListener(webSocket) {
    const form = document.getElementById('form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();
        if (message && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify({ message: message }));
            messageInput.value = ''; // Clear the input after sending
        }
    });
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    document.getElementById('messages').appendChild(messageElement);
}

// Add initChatbox to window.initPageFunctions to ensure it's called at the right time
window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initChatbox);


// ----------- frontend ----------- //
async function loadFriendList()
{
    try
	{
        const users = await fetchAllFriends();
        displayFriends(users);
    }
	catch (error)
	{
        console.error('Une erreur s\'est produite lors du chargement des amis :', error);
    }
}

function fetchAllFriends() {
    return new Promise((resolve, reject) => {
        var auth_token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        };

        if (auth_token && auth_token !== 'undefined' && auth_token !== 'null')
            headers['Authorization'] = 'Token ' + auth_token;

        fetch('/api/get-users/', {
            method: 'GET',
            credentials: 'include',
            headers: headers
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des utilisateurs');
                }
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

async function displayFriends(users)
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
                        .replace('{{avatar}}', avatar)
                        .replace('{{username}}', user.username)
                        .replace('{{actionButtons}}', getChatboxActionButtonsHtml(user))
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

    if (user.status !== 'blocked')
	{
        buttonsHtml += `
            <a class="dropdown-item dangerBtn" onclick="blockUser('{{username}}')">Bloquer</a>
            <a class="dropdown-item dangerBtn" onclick="deleteFriend('{{username}}')">Supprimer</a>
        `;
        if (user.status === 'friends')
		{
            buttonsHtml += `<a class="dropdown-item" onclick="viewProfile('{{username}}')">Voir le profil</a>`;
            buttonsHtml += `<a class="dropdown-item" onclick="sendMessage('{{username}}')">Envoyer un message</a>`;
        }
    }
	else
        buttonsHtml += `<a class="dropdown-item warningBtn" onclick="unblockUser('{{username}}')">Débloquer</a>`;

    console.log(`État de l'utilisateur ${user.username} : ${user.status}`);

    return buttonsHtml;
}

function sendMessage()
{
	const messagesUrl = '/static/html/chatbox/messages.html';
    loadContent(messagesUrl, '#chatboxContainer', messages);

	// To do...
}
