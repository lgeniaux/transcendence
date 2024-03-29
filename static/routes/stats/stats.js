async function fetchStats()
{
    ///api/profile/stats/?username=
    const username = sessionStorage.getItem('currentUsername');
    const url = `/api/profile/stats/?username=${username}`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: getRequestHeaders()
    });

    if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log(data);

    if (data.error)
    {
        console.error(data.error);
        return;
    }
}

export async function init()
{
    // await fetchStats();
    changeGraphPercentage('casual', 70);
    changeGraphPercentage('tournament', 45);
    displayGameHistory('vimercie', 'kolargole', 'Victory', '5 - 3');
    displayTournamentHistory('vimercie', 'Victory', 'Finals');
}

function displayGameHistory(player1Name, player2Name, gameOutcome, score)
{
    var gameHistory = document.getElementById('game-history');

    var template = `
        <div class="game-card card">
            <div class="card-header text-center">${gameOutcome}</div>
            <div class="card-body">
                <div class="row justify-content-between">
                    <div class="col-auto">${player1Name}</div>
                    <div class="col-auto">${score}</div>
                    <div class="col-auto">${player2Name}</div>
                </div>
            </div>
        </div>
    `;

    gameHistory.innerHTML = template;
}

function displayTournamentHistory(playerName, outcome, round)
{
    var tournamentHistory = document.getElementById('tournament-history');

    var template = `
        <div class="tournament-card card">
            <div class="card-header text-center">${outcome}</div>
            <div class="card-body">
                <div class="row justify-content-between">
                    <div class="col-auto">${playerName}</div>
                    <div class="col-auto">Round ${round}</div>
                </div>
            </div>
        </div>
    `;

    tournamentHistory.innerHTML = template;
}


function changeGraphPercentage(section, percentage)
{
    var column = document.getElementById(section + '-column');
    var graphContainer = document.querySelector('.graph-container');
    var maxHeight = graphContainer.clientHeight;

    var newHeight = maxHeight * (percentage / 100);
    column.style.height = newHeight + 'px';
}
