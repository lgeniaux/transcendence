import { displayMessage } from './messageBox.js';

export function initWebsocket()
{
    const auth_token = sessionStorage.getItem('authToken');
    const wsUrl = `wss://${window.location.host}/ws/chat/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);

    webSocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        const sender = message.sender;

        if (sender === window.targetUsername)
            displayMessage(message.message, sender);
    };

    webSocket.onerror = function(event) {
        console.error('WebSocket error:', event);
    };

    observeForm(webSocket);
}

function sendMessageViaWebSocket(webSocket, message, targetUsername)
{
    if (!webSocket)
    {
        console.error('WebSocket is not initialized. Cannot send message');
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

function observeForm(webSocket)
{
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList")
            {
                const form = document.getElementById('form');

                if (form)
                    attachFormSubmitListener(webSocket);
            }
        });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);
}
