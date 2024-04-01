export async function inviteToTournament(username, tournamentId)
{
    const authToken = sessionStorage.getItem('authToken');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
    };

    try
    {
        fetch('/api/tournament/invite/', {
            method: 'POST',
            headers,
            body: JSON.stringify({ username, tournament_id: tournamentId })
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.success)
                console.log('User invited successfully');
            else
                console.log('Failed to invite user:');
        });
    }
    catch (error)
    {
        console.error('Failed to invite user:', error);
    }
}

window.inviteToTournament = inviteToTournament;

function displayCreateTournamentForm()
{
    // append the create-tournament.html to the html of the tournament page
    const overlayHTML = `
        <div id="createTournamentOverlay" class="d-flex justify-content-center align-items-center" tabindex="-1" style="position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 1050;">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background-color: #5a2b00; color: white;">
            <div class="modal-header border-0">
            <h5 class="modal-title" id="createTournamentOverlayLabel"><strong>Create Tournament</strong></h5>
            </div>
            <div class="modal-body">
            <div class="mb-3" id="tournamentName">
                <label for="tournamentNameInput" class="form-label">Tournament Name:</label>
                <input type="text" class="form-control" id="tournamentNameInput" placeholder="Name">
            </div>
            <div class="mb-3">
                <label for="numberOfPlayers" class="form-label">Number of Players:</label>
                <select class="form-select" id="numberOfPlayers">
                <option selected>4</option>
                <option>8</option>
                </select>
            </div>
            <div class="d-grid gap-2">
                <button class="btn btn-success" id="createTournamentButton" type="submit">Create Tournament</button>
            </div>
            </div>
        </div>
        </div>
    </div>
  
    `;

    const overlay = document.createElement('div');
    overlay.innerHTML = overlayHTML;
    document.body.appendChild(overlay);

    initTournamentCreateButton();

}

async function createTournament()
{
    const tournamentName = document.getElementById('tournamentNameInput').value;
    const nb_players_option = document.getElementById('numberOfPlayers');
    const nb_players = nb_players_option.options[nb_players_option.selectedIndex].value;

    const data = { name: tournamentName, nb_players: nb_players };

    try
    {
        const response = await fetch('/api/tournament/create-tournament/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Token ${sessionStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to create tournament');
        
        const result = await response.json();
        console.log('Tournament created:', result);
        sessionStorage.setItem('currentTournamentId', result.tournament_id);
        
        removeCreateTournamentOverlay();

        displayTournamentView();
    }
    catch (error)
    {
        console.error('Failed to create tournament:', error.message);
    }
}

function removeCreateTournamentOverlay()
{
    const overlay = document.getElementById('createTournamentOverlay');

    if (overlay)
        overlay.remove(); // This completely removes the element from the DOM
}



function initTournamentCreateButton()
{
    const createTournamentButton = document.getElementById('createTournamentButton');

    if (createTournamentButton && !createTournamentButton.initialized)
    {
        createTournamentButton.addEventListener('click', async (event) => {
            event.preventDefault();
            await createTournament();
        });
        createTournamentButton.initialized = true;
    }
}

async function fetchTournamentState()
{
    try
    {
        const response = await fetch(`/api/tournament/${sessionStorage.getItem('currentTournamentId')}/state/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${sessionStorage.getItem('authToken')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch tournament state');
        return await response.json();
    }
    catch (error)
    {
        alert('Failed to fetch tournament state');
    }
}


async function removeQuarterFinals()
{
    const quarterFinals = document.getElementsByClassName('quarter-finals');

    if (quarterFinals.length > 0)
        quarterFinals[0].remove();
}


function displayInviteList(users)
{
    const inviteList = document.getElementById('invite-list');

    if (!inviteList)
    {
        console.error('Invite list not found');
        return;
    }
    inviteList.innerHTML = '';
    var avatarSrc = '/frontend/www/images/avatar.png';

    users.forEach(user => {
        // if user is a friend, display the card
        if (user.status == 'friends')
        {
            var userHTML = `
            <div class="card bg-dark text-white mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <img src="${avatarSrc}" alt="User avatar" class="rounded-circle me-3" style="width: 60px; height: 60px;">
                            <div>
                                <h3 class="h5 mb-0">${user.username}</h3>
                                <p class="mb-0" id="status-${user.username}">Status: <span>${user.status}</span></p>
                            </div>
                        </div>
                        <button onclick="window.inviteToTournament('${user.username}', ${sessionStorage.getItem('currentTournamentId')})" class="btn btn-outline-success btn-sm" type="button">Invite</button>
                    </div>
                </div>
            </div>
            `;

        inviteList.innerHTML += userHTML;
        }
    });
}

async function fetchAllUsers() {
    try {
        const authToken = sessionStorage.getItem('authToken');
        const response = await fetch('/api/get-users/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();
        displayInviteList(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

export function goToGame(gameId, type)
{
    sessionStorage.setItem('currentGameId', gameId);
    if (type === 'game') {
        sessionStorage.setItem('endGameRedirect', '/game');
    } else if (type === 'tournament') {
        sessionStorage.setItem('endGameRedirect', '/tournament');
    } else {
        sessionStorage.setItem('endGameRedirect', '/');
    }
}

window.goToGame = goToGame;

async function updateTournamentBracket(state) {
    const tournamentBracket = document.getElementsByClassName('tournament-bracket')[0];
    if (!tournamentBracket) {
        console.error('Tournament bracket not found');
        return;
    }

    // Define all round names that you expect in the tournament
    const roundNames = ['quarter-finals', 'semi-finals', 'finals'];

    // Iterate over each round name
    for (let round_name of roundNames)
    {
        // Since round_name is used as a class, find all elements with this class
        const rounds = document.getElementsByClassName(round_name);
        for (let round of rounds) {
            const matches = round.getElementsByClassName('match');
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const player1 = match.querySelector('#player1');
                const player2 = match.querySelector('#player2');
                const score1 = match.querySelector('.score-p1 h4');
                const score2 = match.querySelector('.score-p2 h4');

                const game = state.state[round_name] && state.state[round_name][i];
                if (game && game.status === "finished") {
                    player1.innerText = game.player1;
                    player2.innerText = game.player2;
                    score1.innerText = game.score_player1;
                    score2.innerText = game.score_player2;
                }
            }
        }
    }
}


async function displayTournamentView()
{
    const state = await fetchTournamentState();

    if (!state)
        return;

    const tournamentContainer = document.getElementById('tournament-container');
    if (!tournamentContainer) {
        console.error('Tournament container not found');
        return;
    }

    //displayInviteContacts();

    if (state.nb_players === 4) {
        removeQuarterFinals();
    }

    console.log('Tournament state:', state); 
    if (state.state.status !== "waiting for all participants to join") {
        const inviteList = document.getElementsByClassName('invite-list');
        if (inviteList.length > 0) {
            inviteList[0].remove();
        }
    }
    if (state.state.status === "in progress")
    {
        if (state.game_to_play)
            goToGame(state.game_to_play, 'tournament');
        
    }
    else if (state.state.status === "finished")
    {
        // display the winner of the tournament
        const winner = state.state.winner;
        const winnerHTML = `
        <div class="alert alert-success" role="alert">
            <strong>The winner of the tournament is ${winner}</strong>
        </div>
        `;
        tournamentContainer.innerHTML += winnerHTML;
    }
    else
    {
        const users = await fetchAllUsers();
    }
    updateTournamentBracket(state);   
}

export async function init()
{
    const tournamentId = sessionStorage.getItem('currentTournamentId');

    if (!tournamentId)
    {
        displayCreateTournamentForm();
        initTournamentCreateButton();
    }
    else
    {
        const authToken = sessionStorage.getItem('authToken');
        const ws = new WebSocket(`wss://${window.location.host}/ws/tournament/${authToken}/${tournamentId}/`);

        ws.onopen = function (event) {
            console.log('WebSocket opened');
            displayTournamentView();
        }

        ws.onclose = function (event) {
            console.log('WebSocket closed');
        }

        ws.onerror = function (event) {
            console.error('WebSocket error:', event);
        }

        ws.onmessage = function (event) {
            const message = JSON.parse(event.data);
            console.log('Live message:', message);
            if (message) {
                const game = undefined;
                displayTournamentView(game, true);
            }
        }
    }
}
