if (!window.allUsers) {
    window.allUsers = [];
}

async function inviteToTournament(user, tournamentId) {
    const authToken = sessionStorage.getItem('authToken');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
    };
    try {
        fetch('/api/tournament/invite/', {
            method: 'POST',
            headers,
            body: JSON.stringify({ username: user.username, tournament_id: tournamentId })
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.success) {
                console.log('User invited successfully');
            }
        });
    }
    catch (error) {
        console.error('Error inviting user:', error);
    }
}



function displayCreateTournamentForm() {
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
async function createTournament() {
    const tournamentName = document.getElementById('tournamentNameInput').value;
    const nb_players_option = document.getElementById('numberOfPlayers');
    const nb_players = nb_players_option.options[nb_players_option.selectedIndex].value;

    const data = { name: tournamentName, nb_players: nb_players };

    try {
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
    } catch (error) {
        console.error('Failed to create tournament:', error.message);
    }
}

function removeCreateTournamentOverlay() {
    const overlay = document.getElementById('createTournamentOverlay');
    if (overlay) {
        overlay.remove(); // This completely removes the element from the DOM
    }
}



function initTournamentCreateButton() {
    const createTournamentButton = document.getElementById('createTournamentButton');
    if (createTournamentButton && !createTournamentButton.initialized) {
        createTournamentButton.addEventListener('click', async (event) => {
            event.preventDefault();
            await createTournament();
        });
        createTournamentButton.initialized = true;
    }
}

async function fetchAllUsers() {
    try {
        const response = await fetch('/api/get-users/', {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        allUsers = data;
        displayUsers(allUsers);
    }
    catch (error) {
        console.error('Error:', error);
    }
}

async function fetchTournamentState() {
    try {
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
    } catch (error) {
        alert('Failed to fetch tournament state');
    }
}


function displayInviteContacts() {
    const tournamentContainer = document.getElementById('tournament-container');
    // append a div with the id 'tournament-container' to the html of the tournament page
    const tournamentHTML = `
        <div class="col-3">
        <div class="listContainer">
            <h2>Invite Contacts</h2>
            <div id="contacts-list" class="search-results">
                <p>Loading Contacts . . . </p>
            </div>
        </div>
    </div>`;
    const inviteList = document.createElement('div');
    inviteList.innerHTML = tournamentHTML;
    tournamentContainer.appendChild(inviteList);
}


async function generateQuarterFinals(state) {

}

async function generateSemiFinalsAndFinals(state) {
}

async function displayTournamentView() {
    const state = await fetchTournamentState();
    if (!state) {
        return;
    }

    const tournamentContainer = document.getElementById('tournament-container');
    if (!tournamentContainer) {
        console.error('Tournament container not found');
        return;
    }
    tournamentContainer.innerHTML = '';

    //displayInviteContacts();

    if (state.nb_players === 4) {
        generateSemiFinalsAndFinals(state);
    }
    else if (state.nb_players === 8) {
        generateQuarterFinals(state);
        generateSemiFinalsAndFinals(state);
    }
    else {
        console.error('Invalid number of players:', state.nb_players);
    }
}


function initTournament() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        displayCreateTournamentForm();
        initTournamentCreateButton();
    }
    else {
        const authToken = sessionStorage.getItem('authToken');
        const ws = new WebSocket(`ws://${window.location.host}/ws/tournament/${authToken}/${tournamentId}/`);

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
            // Handle the message here
        }
    }
}



window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initTournament);