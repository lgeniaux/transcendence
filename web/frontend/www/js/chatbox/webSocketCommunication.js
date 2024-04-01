import { displayMessage } from './messageBox.js';

export function initWebsocket()
{
    const auth_token = sessionStorage.getItem('authToken');
    const wsUrl = `wss://${window.location.host}/ws/chat/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);
    
    webSocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Target username:', window.targetUsername)
        console.log('Live message:', message);
        //get sender of the message
        const sender = message.sender;
        console.log('message :', message.message);
        
        if (sender === window.targetUsername)
        displayMessage(message.message, sender);
};

    webSocket.onopen = function()   {
        console.log('Chatbox WebSocket opened');
    };

    webSocket.onclose = function() {
        console.log('WebSocket closed');
    };

    webSocket.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    observeForm(webSocket); // Nouvelle fonction pour observer le formulaire
}

// Fonction pour envoyer un message via WebSocket
function sendMessageViaWebSocket(webSocket, message, targetUsername)
{
    if (!targetUsername)
        return (false)
    //handle the case where a malicious user tries to send a NULL message
    if (!message)
        return false;
    //limit the message size at 250 characters
    if (message.length > 250)
    {
        alert('Message too long. Maximum 250 characters allowed');
        return false;
    }

    if (!webSocket)
    {
        console.error('WebSocket is not initialized, please refresh the page');
        return false;
    }

    if (webSocket.readyState === WebSocket.OPEN)
	{
        webSocket.send(JSON.stringify({
            message: message,
            type: 'message',
            username: targetUsername
        }));
        return true;
    }
    else
    {
        console.error('WebSocket is not open. Cannot send message');
        return false;
    }
}




function attachFormSubmitListener(webSocket)
{
    const form = document.getElementById('form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const messageInput = document.getElementById('message');
        const message = messageInput.value.trim();
        const targetUsername = window.targetUsername;

        if (message)
		{
            if (sendMessageViaWebSocket(webSocket, message, targetUsername))
                displayMessage(message, 'Moi', true);
            messageInput.value = '';
        }
    });
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
                    // observer.disconnect();
                }
            }
        });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config); // Commencez à observer le document entier.
}
