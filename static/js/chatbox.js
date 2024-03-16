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

