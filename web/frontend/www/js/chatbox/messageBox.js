import { loadContent, getRequestHeaders } from '../utils.js';

export async function loadMessageBox(username)
{
    await loadContent('/frontend/www/html/chatbox/messagebox.html', '#chatboxContainer');
    await fetchAndDisplayStoredMessages(username);
    document.getElementById('chatboxHeader').innerText = username;
    document.getElementById('message').focus();
}

window.loadMessageBox = loadMessageBox;

export function displayMessage(content, isSentByUser)
{
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', isSentByUser ? 'sent' : 'received');

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isSentByUser ? 'message-sent' : 'message-received');
    messageElement.innerText = `${content}`;

    messageContainer.appendChild(messageElement);

    const messagesContainer = document.getElementById('messages');
    messagesContainer.appendChild(messageContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function fetchAndDisplayStoredMessages(targetUsername)
{
    try
    {
        const requestBody = JSON.stringify({ username: targetUsername, message_max_count: 100});
        
        const response = await fetch('/api/get-messages/', {
            method: 'POST',
            credentials: 'include',
            headers: getRequestHeaders(),
            body: requestBody
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        data.forEach(message => {
            displayMessage(message.content, message.sender !== targetUsername);
        });
    }
    catch (error)
    {
        console.error('Error fetching messages:', error);
    }
}
