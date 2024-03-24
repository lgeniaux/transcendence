function getGameStatus() {
    const gameId = sessionStorage.getItem('currentGameId');
    const authToken = sessionStorage.getItem('authToken');

    fetch(`/api/game/get-status/?`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${authToken}`
        }
    })
        .then(response => {
            if (response.ok)
                return response.json();
            else
                throw new Error('Failed to get game status');
        })
        .then(game => {
            console.log('Game:', game);
            displayGameView(game);
        })
        .catch(error => {
            console.error('Error getting game status:', error);
        });
}


function displayGameView() {
    getGameStatus();
}


function initGame() {
    const gameId = sessionStorage.getItem('currentGameId');

    if (!gameId)
        window.location = '/';
    else {
        const authToken = sessionStorage.getItem('authToken');
        const ws = new WebSocket(`ws://${window.location.host}/ws/game/${authToken}/${gameId}/`);

        ws.onopen = function (event) {
            console.log('WebSocket opened');
            displayGameView();

            ws.onclose = function (event) {
                console.log('WebSocket closed');
            }

            ws.onerror = function (event) {
                console.error('WebSocket error:', event);
            }

            ws.onmessage = function (event) {
                const game = JSON.parse(event.data);
                console.log('Live game:', game);
                displayGameView(game);
            }
        }
    }
}


window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initGame);