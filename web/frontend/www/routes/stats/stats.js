async function fetchStats() {
    try {
        const username = sessionStorage.getItem('currentStatsUsername');

        if (!username) {
            throw new Error('No username provided');
        }

        const response = await fetch(`/api/stats/${username}/fetch/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${sessionStorage.getItem('authToken')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            sessionStorage.removeItem('currentStatsUsername');
            alert('User not found');
            window.location.href = '/dashboard';
        } else {


            const data = await response.json();

            return data;

        }
    }catch (error) {
        alert('Error:', error);
    }
}

export async function init() {
    const response = await fetchStats();

    updateUsername(sessionStorage.getItem('currentStatsUsername'));
    changeGraphPercentage('casual', response.user_stats.game_winrate);
    changeGraphLabel('casual', response.user_stats.game_winrate);

    changeGraphPercentage('tournament', response.user_stats.tournament_winrate);
    changeGraphLabel('tournament', response.user_stats.tournament_winrate);

    response.game_history.forEach(game => {
        displayGameHistory(game.player1, game.player2, game.winner, game.score_player1, game.score_player2, game.start_time, game.game_id);
    });

    response.tournament_history.forEach(tournament => {
        displayTournamentHistory(tournament.winner, tournament.name, tournament.start_time, tournament.tournament_id);
    });

    changeGraphAverageScore('user', response.user_stats.average_scored_value);
    changeGraphAverageScore('opponent', response.user_stats.average_opponent_score);
}

function updateUsername(username) {
    var usernameElement = document.getElementById('stats-username');
    if (username === 'me')
        usernameElement.innerText = 'My stats';
    else
        usernameElement.innerText = username + "'s stats";
}

function displayGameHistory(player1, player2, winner, score_player1, score_player2, start_time, game_id) {
    var gameHistory = document.getElementById('game-history');

    var template = `
        <div class="game-card card" type="button" data-spa="/game" data-spa-id="${game_id}">
            <div class="card-header text-center"><strong>Game ${game_id}</strong> - ${new Date(start_time).toLocaleDateString()}</div>
            <div class="card-body">
                <div class="row justify-content-between">
                    <div class="col-3 text-center">${winner === player1 ? `<strong>${player1}</strong>` : player1}</div>
                    <div class="col-6 text-center">${score_player1} - ${score_player2}</div>
                    <div class="col-3 text-center">${winner === player2 ? `<strong>${player2}</strong>` : player2}</div>
                </div>
            </div>
        </div>
    `;

    gameHistory.innerHTML += template;
}

function displayTournamentHistory(winner, name, start_time, tournament_id) {
    var tournamentHistory = document.getElementById('tournament-history');

    var template = `
        <div class="tournament-card card" type="button" data-spa="/tournament" data-spa-id="${tournament_id}">
            <div class="card-header text-center bg-primary text-white">Tournament: <strong>${name}</strong> - ${new Date(start_time).toLocaleDateString()}</div>
            <div class="card-body text-center">
                <h5 class="card-title">${winner} won</h5>
            </div>
        </div>
    `;

    tournamentHistory.innerHTML += template;
}


function changeGraphPercentage(section, percentage) {
    var column = document.getElementById(section + '-column');
    var graphContainer = document.querySelector('.graph-container');
    var maxHeight = graphContainer.clientHeight;

    var newHeight = maxHeight * (percentage / 100);
    column.style.height = newHeight + 'px';
}

function changeGraphLabel(section, percentage) {
    var label = document.getElementById(section + '-percentage');
    label.innerText = Math.round(percentage) + '%';
}

function changeGraphAverageScore(section, average_score) {
    var column = document.getElementById(section + '-column');
    var graphContainer = document.querySelector('.graph-container');
    var maxHeight = graphContainer.clientHeight;

    var newHeight = maxHeight * (average_score / 5); // Adjusted for average score between 0 and 5
    column.style.height = newHeight + 'px';
    
    var label = document.getElementById('average-' + section);
    label.innerText = average_score.toFixed(2) + ' / 5' // Display average score with 2 decimal places
}
