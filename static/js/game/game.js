import { launchGame } from "/static/game/js/main.js";

function displayGameView(game) {
    console.log('Displaying game:', game);
    var player = game.player;
    game = game.game;
    if (game.status === 'waiting to start' && player === 'player2') {
        document.getElementById("game").removeEventListener("click", startGame);
        // display a view saying "Game is ready, you are playing as the guest so you must go play on the computer {username player1}"
        document.getElementById("game").innerHTML = `
            <div class="alert alert-info" role="alert">
                Game is ready, you are playing as the guest so you must go play on <strong>${game.player1}</strong>'s computer.
            </div>
        `;
    }
    else if (game.status === 'waiting to start' && player === 'player1') {
    }
    else if (game.status === 'finished') {
        // display the view with the score
    }
    
}

async function startGame() 
{
    document.getElementById("game").removeEventListener("click", startGame);
    const gameId = sessionStorage.getItem('currentGameId');
    const headers = {
        'Authorization': `Token ${sessionStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    }

    const r = await fetch('/api/game/start/', {
        method: 'POST',
        headers,
        body: JSON.stringify({game_id: gameId})
    })
    if (!r.ok)
    {
        alert("There was an error starting the game");
        navigate('/');
        return;
    }
    let score = "";
    let results = {};
    try {
        const game = await getGame(gameId, headers);
        results = await launchGame(game.player1, game.player2, window.properties);
    } catch (error) {
        alert('Current game not found, defaulting to new game');
        results = await launchGame("Left player", "Right player", window.properties);
    }
    score = results.score1 + "-" + results.score2;
    endGame(score, gameId, headers);
}

function endGame(score, gameId, headers) {
    const data = {
        game_id: gameId,
        score: score
    }

    fetch('/api/game/end/', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log('Game ended:', data);
    });
}

async function getGame(gameId, headers) {
    const r = await fetch(`/api/game/get-status/${gameId}/`, {
        method: 'GET',
        headers
    });

    if (!r.ok)
        throw new Error(`${await r.text()}`);
    
    return (await r.json()).game;
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
        console.log('Response:', response);
        return response.json();
    }
    ).then(game => {
        console.log('Game status:', game);
        displayGameView(game);
    }).catch(error => {
        console.error('Error getting game status:', error);
    });

}

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
            const message = JSON.parse(event.data);
            console.log('Live game:', message);
            if (message === 'Game has been reset') {
                getGameStatus();
            }
        }
    }
}



window.initPageFunctions = window.initPageFunctions || [];
document.getElementById("game").addEventListener("click", startGame);