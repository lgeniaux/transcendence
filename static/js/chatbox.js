function initChatbox() {
    const auth_token = localStorage.getItem('authToken');
    const wsUrl = `ws://${window.location.host}/ws/chat/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);
    
    webSocket.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Live message:', message);
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

// Add initChatbox to window.initPageFunctions to ensure it's called at the right time
window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initChatbox);

