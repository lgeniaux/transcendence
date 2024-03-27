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
        document.getElementById("game").innerHTML = `
        <div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card mb-3">
                <div class="card-header bg-dark text-center">
                    <h4 class="text-light"><strong>Game nº${game.game_id}</strong></h4>
                </div>
                <div class="card-body bg-dark">
                    <div class="row g-0">
                        <div class="col-md-6 d-flex flex-column align-items-center justify-content-center py-3 position-relative">
                            <h5 class="${game.winner === game.player1 ? 'text-warning font-weight-bold' : 'text-white'}">
                                ${game.player1}
                            </h5>
                            <p class="display-6 ${game.winner === game.player1 ? 'text-warning font-weight-bold' : 'text-white'}">
                                ${game.score_player1}
                            </p>
                            ${game.winner === game.player1 ? '<img src="/path/to/trophy-icon.png" class="trophy-icon" alt="Trophy">' : ''}
                        </div>
                        <div class="col-md-6 d-flex flex-column align-items-center justify-content-center py-3">
                            <h5 class="${game.winner === game.player2 ? 'text-warning font-weight-bold' : 'text-white'}">
                                ${game.player2}
                            </h5>
                            <p class="display-6 ${game.winner === game.player2 ? 'text-warning font-weight-bold' : 'text-white'}">
                                ${game.score_player2}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-dark d-flex flex-column align-items-center justify-content-center">
                    ${game.tournament ? `<p class="text-light mb-2">Tournament: ${game.tournament}</p>` : ''}
                    ${game.round_name ? `<p class="text-light mb-2">Round: ${game.round_name}</p>` : ''}
                    <a href="/" class="btn btn-lg btn-warning text-dark mt-2">Continue</a>
                </div>
            </div>
        </div>
    </div>
</div>


      
        `;
    }



}

async function startGame() {
    document.getElementById("game").removeEventListener("click", startGame);
    const gameId = sessionStorage.getItem('currentGameId');
    const headers = {
        'Authorization': `Token ${sessionStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    }

    const r = await fetch('/api/game/start/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ game_id: gameId })
    })
    if (!r.ok) {
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

    return fetch(`/api/game/get-status/${gameId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${authToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Game status:', data);
            return data;
        })
        .catch(error => {
            console.error('Error getting game status:', error);
            throw error;
        });
}


export async function init() {
    const gameId = sessionStorage.getItem('currentGameId');

    if (!gameId) {
        window.location = '/';
    } else {
        const authToken = sessionStorage.getItem('authToken');
        getGameStatus().then(game => {
            if (game.game.status === 'finished') {
                displayGameView(game);
            } else if (game.game.status === 'waiting to start' || game.game.status === 'in progress') {
                // Attempt to open the WebSocket only if the game is not finished
                window.ws = new WebSocket(`ws://${window.location.host}/ws/game/${authToken}/${gameId}/`);

                ws.onopen = function (event) {
                    console.log('WebSocket opened');
                    displayGameView(game);
                };

                ws.onclose = function (event) {
                    console.log('WebSocket closed');
                };

                ws.onerror = function (event) {
                    console.error('WebSocket error:', event);
                };

                ws.onmessage = function (event) {
                    const message = JSON.parse(event.data);
                    console.log('Live game:', message);
                    if (message.message === 'Game has been reset' || message.message === 'Game has ended') {
                        alert(message.message);
                    }
                };

                window.addEventListener('beforeunload', function () {
                    if (ws) {
                        ws.close();
                        console.log('WebSocket closed');
                    }
                });
            }
        }).catch(error => {
            console.error('Error getting game status:', error);
        });
    }
    document.getElementById("game").addEventListener("click", startGame);

}