// ----------------- backend ----------------- //

let chatSocket = new WebSocket("ws://" + window.location.host + "/ws/chat/");

//print message
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data);

    if (data.type === 'chat_message') {
        let messages = document.getElementById('messages');
        messages.insertAdjacentHTML('beforeend', `<p>${data.sender}: ${data.message}</p>`);
    };
};

// Send message

let form = document.getElementById('form');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    let messageInput = document.getElementById('message');
    let messageText = messageInput.value;

    if (messageText.startsWith("/msg")) {
        let messageParts = messageText.split(" ");
        if (messageParts.length >= 3) {
            let nickname = messageParts[1];
            let message = messageParts.slice(2).join(" ");
            chatSocket.send(JSON.stringify({
                'command': 'send_private_message',
                'message': message,
                'nickname': nickname
            }));
        }
    } else {
        chatSocket.send(JSON.stringify({
            'message': messageText
        }));
    }
    form.reset();
});


// ----------------- frontend ----------------- //

function fetchAllFriends() {
    var auth_token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };
    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }

    fetch('/api/get-users/', {
        method: 'GET',
        credentials: 'include',
        headers: headers
    })
        .then(response => response.json())
        .then(data => {
            allUsers = data;
            displayFriends(allUsers);
        }).catch(error => console.error('Error:', error));
}

async function displayFriends(users)
{
    try
	{
        // Récupération du contenu du fichier HTML contenant le modèle userTemplate
        const templateContent = await getFileContent('static/html/chatbox/friendlist.html');
        var usersList = document.getElementById('chatboxContainer');

        usersList.innerHTML = '';

        // Vérification si le contenu du fichier template a été correctement chargé
        if (templateContent)
		{
            users.forEach(user => {
                var actionContainerId = `actions-${user.username}`;
                var avatar = user.avatar ? user.avatar : 'static/img/person-fill.svg'; // Avatar par défaut
                var userHTML = templateContent
                    .replace('{{avatar}}', avatar)
                    .replace('{{username}}', user.username)
                    .replace('{{actionButtons}}', getActionButtonsHtml(user))
					.replace('{{actionContainerId}}', actionContainerId);

                usersList.innerHTML += userHTML;
            });
        }
		else
		{
            console.error('Le chargement du fichier de modèle a échoué.');
        }
    }
	catch (error)
	{
        console.error('Une erreur s\'est produite lors du chargement et de l\'affichage des amis :', error);
    }
}

function getActionButtonsHtml(user)
{
    let buttonsHtml = '';

    // Génère les boutons en fonction de l'état de l'utilisateur
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
	{
        buttonsHtml += `<a class="dropdown-item warningBtn" onclick="unblockUser('{{username}}')">Débloquer</a>`;
    }

    // Afficher l'état de l'utilisateur dans la console
    console.log(`État de l'utilisateur ${user.username} : ${user.status}`);

    return buttonsHtml;
}


// function sendUserActionRequest(username, action) {
//     var auth_token = localStorage.getItem('authToken');
//     const headers = {
//         'Content-Type': 'application/json',
//         'X-CSRFToken': getCSRFToken(),
//         'Authorization': 'Token ' + auth_token
//     };

//     const data = {
//         username: username,
//         action: action
//     };

//     return fetch(`/api/${action}-user/`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: headers,
//         body: JSON.stringify(data)
//     });
// }

// async function handleUserActionResponse(response, username, action, newStatus)
// {
//     if (response.ok)
// 	{
//         document.getElementById(`status-${username}`).textContent = newStatus;
//         document.getElementById(`actions-${username}`).innerHTML = getActionButtonsHtml({username: username, status: newStatus});
//         console.log(`User action (${response.statusText}): ${action}`);
//     }
// 	else
// 	{
//         console.error(`Failed to ${action} user: ${response.statusText}`);
//     }
// }

// async function performUserAction(username, action, newStatus)
// {
//     try
// 	{
//         const response = await sendUserActionRequest(username, action);
//         await handleUserActionResponse(response, username, action, newStatus);
//     }
// 	catch (error)
// 	{
//         console.error('Error:', error);
//     }
// }


// async function blockUser(username)
// {
//     await performUserAction(username, 'block', 'blocked');
// }

// async function unblockUser(username)
// {
//     await performUserAction(username, 'unblock', 'not friends yet');
// }

// async function addFriend(username)
// {
//     await performUserAction(username, 'add', 'friends');
// }

// async function deleteFriend(username)
// {
//     await performUserAction(username, 'delete', 'not friends yet');
// }
