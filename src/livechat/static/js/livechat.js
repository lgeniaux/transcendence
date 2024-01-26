function sendMessage()
{
    // Récupérer le contenu de l'input
    var userInput = document.getElementById("userInput").value;

    // Créer un élément de message
    var messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.textContent = userInput;

    // Ajouter le message à la liste des messages
    var messageContainer = document.getElementById("messageContainer");
    messageContainer.appendChild(messageElement);

    // Effacer le contenu de l'input
    document.getElementById("userInput").value = "";
}