function displayGameView(game) {
    player = game.player;
    game = game.game;
    if (game.status === 'waiting to start' && player === 'player2') {
        document.querySelector('.game-status').innerHTML = 'Waiting for player 1 to start the game';
    }
    
}

function startGame() {

}

function getGameStatus() {
    const gameId = sessionStorage.getItem('currentGameId');
    const authToken = sessionStorage.getItem('authToken');

    const response = fetch(`/api/game/get-status/${gameId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${authToken}`
        }
    })

    response.then(response => {
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        
        return response.json();
    }
    ).then(game => {
        console.log('Game status:', game);
        displayGameView(game);
    }).catch(error => {

    });

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
            getGameStatus();

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