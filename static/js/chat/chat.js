let url = "ws://" + window.location.host + "/ws/chat/testroom/";
const chatSocket = new WebSocket(url);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log(data);

    if (data.type === 'chat_message') {
        let messages = document.getElementById('messages');
        messages.insertAdjacentHTML('beforeend', '<p>' + data.message + '</p>');

        // Faire défiler automatiquement vers le bas
        messages.scrollTop = messages.scrollHeight;
    };
};

let form = document.getElementById('form');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    let messageInput = document.getElementById('message');
    let message = messageInput.value;
    chatSocket.send(JSON.stringify({
        'message': message
    }));

    // Réinitialiser le formulaire
    form.reset();
    
    // Faire défiler automatiquement vers le bas après l'envoi du message
    let messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
});
