import { launchGame, createGame } from "/static/game/js/main.js";
import { getCSRFToken } from "/static/js/profile.js";

async function getUserInfos(auth_token = null) {
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
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

const userInfos = await getUserInfos(localStorage.getItem('authToken')).catch(error => console.error('Error:', error));
if (userInfos && userInfos.username) {
    let properties = await createGame();
    // TODO: wait for user to press the start button
	console.log(await launchGame(userInfos.username, "Guest", properties));
}
else {
    let properties = await createGame();
    // TODO: wait for user to press the start button
	console.log(await launchGame("Left player", "Right player", properties));
}