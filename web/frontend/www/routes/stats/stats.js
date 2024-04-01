async function fetchStats()
{
    try
    {
        const username = sessionStorage.getItem('currentStatsUsername');

        if (!username)
            throw new Error('No username provided');

        const response = await fetch(`/api/stats/${username}/fetch/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${sessionStorage.getItem('authToken')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok)
            throw new Error('Failed to fetch stats');

        return await response.json();
    }
    catch(error)
    {
        console.error(error);
    }
}

export async function init()
{
    const   response = await fetchStats();

    updateUsername(sessionStorage.getItem('currentStatsUsername'));
    changeGraphPercentage('casual', response.user_stats.game_winrate);
    changeGraphLabel('casual', response.user_stats.game_winrate);

    changeGraphPercentage('tournament', response.user_stats.tournament_winrate);
    changeGraphLabel('tournament', response.user_stats.tournament_winrate);
}

function updateUsername(username)
{
    var usernameElement = document.getElementById('stats-username');
    if (username === 'me')
        usernameElement.innerText = 'My stats';
    else
        usernameElement.innerText = username + "'s stats";
}

function displayGameHistory(player1Name, player2Name, gameOutcome, score)
{
    var gameHistory = document.getElementById('game-history');

    var template = `
        <div class="game-card card">
            <div class="card-header text-center">${gameOutcome}</div>
            <div class="card-body">
                <div class="row justify-content-between">
                    <div class="col-3 text-center">${player1Name}</div>
                    <div class="col-6 text-center">${score}</div>
                    <div class="col-3 text-center">${player2Name}</div>
                </div>
            </div>
        </div>
    `;

    gameHistory.innerHTML += template;
}

function displayTournamentHistory(playerName, outcome, round)
{
    var tournamentHistory = document.getElementById('tournament-history');

    var template = `
        <div class="tournament-card card">
            <div class="card-header text-center">${outcome}</div>
            <div class="card-body">
                <div class="row">
                    <div class="activePlayer col-3 text-center">${playerName}</div>
                    <div class="col-6 text-center">Round ${round}</div>
                    <div class="col-3 text-center"></div>
                </div>
            </div>
        </div>
    `;

    tournamentHistory.innerHTML += template;
}

function changeGraphPercentage(section, percentage)
{
    var column = document.getElementById(section + '-column');
    var graphContainer = document.querySelector('.graph-container');
    var maxHeight = graphContainer.clientHeight;

    var newHeight = maxHeight * (percentage / 100);
    column.style.height = newHeight + 'px';
}

function changeGraphLabel(section, percentage)
{
    var label = document.getElementById(section + '-percentage');
    label.innerText = Math.round(percentage) + '%';
}