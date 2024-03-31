import { launchGame, createGame } from "/frontend/www/game/js/main.js";

async function getUserInfos(auth_token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }
	else {
		return null;
	}

    return fetch('/api/me/', {
        method: 'GET',
        credentials: 'include',
        headers: headers
    })
	.then(response => response.json())
	.catch(error => console.error('Error:', error));
}

async function startGame() {
    properties = window.properties;
    setTimeout(() => {
        for (let i = 0; i < document.getElementsByClassName("score").length; i++) {
            document.getElementsByClassName("score")[i].style.opacity = 1;
        }
    }, 3000);
    const userInfos = await getUserInfos(sessionStorage.getItem('authToken')).catch(error => console.error('Error:', error));
    if (userInfos && userInfos.username)
        await launchGame(userInfos.username, "Guest", properties)
    else
        await launchGame("Left player", "Right player", properties);
}

window.properties = await createGame();
document.getElementById("game").addEventListener("click", startGame);
