import { launchGame, createGame } from "/static/game/js/main.js";

function displayGameView(game) {
    player = game.player;
    game = game.game;
    if (game.status === 'waiting to start' && player === 'player2') {
        document.querySelector('.game-status').innerHTML = 'Waiting for player 1 to start the game';
    }
    
}

async function startGame() 
{
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
        alert("error starting game xD, starting it anyway"); //FIXME: xD
    const properties = await createGame()
    properties.rules.maxPoints = 5;
    let score = "";
    let results = {};
    try {
        const game = await getGame(gameId, headers);
        results = await launchGame(game.player1, game.player2, properties);
    } catch (error) {
        alert('Current game not found, defaulting to new game');
        results = await launchGame("Left player", "Right player", properties);
    }
    score = results.score1 + "-" + results.score2;
    endGame(score);
}

function endGame(score) {

    const gameId = sessionStorage.getItem('currentGameId');
    const authToken = sessionStorage.getItem('authToken');
    const headers = {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json'
    }
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

async function getGame(gameId, headers) {
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
window.startGame = startGame;
window.endGame = endGame;