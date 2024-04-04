import { createGame, launchGame } from "/frontend/www/js/game/main.js";

async function displayGameView(game, fetch = false) {
    if (fetch) {
        game = await (getGameStatus().catch(error => {
            console.error('Error getting game status:', error);
            return null;
        }));
    }

    var player = game.player;
    game = game.game;
    if (game.status === 'waiting to start' && player === 'player2') {
        document.getElementById("game").removeEventListener("click", startGame);
        document.getElementById("game").innerHTML = `
        <div class="alert alert-info" role="alert">
        Game is ready, you are playing as the guest so you must go play on <strong>${game.player1}</strong>'s computer.
        </div>
        `;
    }
    else if (game.status === 'waiting to start' && player === 'player1') {
        window.properties = await createGame();
        document.getElementById("game").addEventListener("click", startGame);
    }
    else if (game.status === 'finished') {
        document.getElementById("game").removeEventListener("click", startGame);
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
                            ${game.winner === game.player1 ? '<img src="static/img/trophy.svg" class="trophy-icon" alt="Trophy">' : ''}
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
    });
    if (!r.ok)
        return;
    let score = "";
    let results = {};
    setTimeout(() => {
        for (let i = 0; i < document.getElementsByClassName("score").length; i++) {
            document.getElementsByClassName("score")[i].style.opacity = 1;
        }
    }, 3000);
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

async function endGame(score, gameId, headers) {
    const r = await fetch('/api/game/end/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ game_id: gameId, score })
    });

    if (!r.ok) {
        alert("There was an error ending the game");
        return;
    }
    const redirection = sessionStorage.getItem('endGameRedirect');
    if (redirection) {
        sessionStorage.removeItem('endGameRedirect');
        window.location = redirection;
    }
    else {
        window.location = '/';
    }
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
            return data;
        })
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
                window.ws = new WebSocket(`wss://${window.location.host}/ws/game/${authToken}/${gameId}/`);

                ws.onopen = function (event) {
                    displayGameView(game);
                };

                ws.onerror = function (event) {
                    console.error('WebSocket error:', event);
                };

                ws.onmessage = function (event) {
                    const message = JSON.parse(event.data);
                    if ( message.message === 'Game has ended') {
                        alert(message.message);
                        displayGameView(game, true);
                    }
                };

                window.addEventListener('beforeunload', function () {
                    if (ws) {
                        ws.close();
                    }
                });
            }
        }).catch(error => {
            console.error('Error getting game status:', error);
        });
    }

}