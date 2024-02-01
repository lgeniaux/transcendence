var chatForm = document.getElementById("chatForm");

chatForm.addEventListener("submit", handleSubmit);

function handleSubmit(event)
{
	event.preventDefault();

	var userInput = document.getElementById("userInput").value.trim();

    if (userInput !== "")
    {
        handleFormSubmission(userInput);
        document.getElementById("userInput").value = "";
    }
}

function handleFormSubmission(message)
{
    var messageContainer = document.getElementById("messageContainer");
    var newMessage = document.createElement("div");

    newMessage.textContent = message;

    messageContainer.appendChild(newMessage);
	messageContainer.scrollTop = messageContainer.scrollHeight;
}
