import { loadContent, getRequestHeaders } from '../utils.js';

export async function loadMessageBox(username)
{
    await loadContent('/static/html/chatbox/messagebox.html', '#chatboxContainer');
    await fetchAndDisplayStoredMessages(username);
    document.getElementById('chatboxHeader').innerText = username;
}

window.loadMessageBox = loadMessageBox;

export function displayMessage(content, isSentByUser)
{
    // Crée un conteneur pour le message qui occupe toute la largeur
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', isSentByUser ? 'sent' : 'received');

    // Crée l'élément de message avec le contenu et le style approprié
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isSentByUser ? 'message-sent' : 'message-received');
    messageElement.innerText = `${content}`;

    // Ajoute le messageElement comme enfant du messageContainer
    messageContainer.appendChild(messageElement);

    // Ajoute le messageContainer au conteneur de messages global
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
