if (!window.allUsers) {
    window.allUsers = [];
}

async function inviteToTournament(user, tournamentId){
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
            if(data.success) {
                console.log('User invited successfully');
            }
        });
    }
    catch(error) {
        console.error('Error inviting user:', error);
    }
}



function displayCreateTournamentForm() {
    // append the create-tournament.html to the html of the tournament page
    const modalHTML = `
        <div class="modal" id="createTournamentOverlay" tabindex="-1" aria-labelledby="createTournamentOverlayLabel" aria-modal="true" role="dialog">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="background-color: #5a2b00; color: white;">
                    <div class="modal-header border-0">
                        <h5 class="modal-title" id="createTournamentOverlayLabel">Create Tournament</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
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
                                    <option>16</option>
                                </select>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-success" id="createTournamentButton" type="submit">Create Tournament</button>
                            </div>
                    </div>
                    <div class="modal-footer border-0">
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-backdrop fade"></div>
    `;

    const overlay = document.createElement('div');
    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay);

    const createTournamentOverlay = new bootstrap.Modal(document.getElementById('createTournamentOverlay'));
    createTournamentOverlay.show();

}

async function createTournament() {
    const tournamentName = document.getElementById('tournamentNameInput').value;
    const nb_players_option = document.getElementById('numberOfPlayers');
    const nb_players = nb_players_option.options[nb_players_option.selectedIndex].value;

    const data = { name: tournamentName, nb_players: nb_players };

    try {
        const response = await fetch('/api/tournament/create-tournament/', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok)
            throw new Error('Failed to create tournament');

        const result = await response.json();
        console.log('Tournament created:', result);
        sessionStorage.setItem('currentTournamentId', result.tournament_id);
        window.location.reload();
    }
    catch (error) {
        console.error('Failed to create tournament:', error);
    }
}



function initTournamentCreateButton() {
    const createTournamentButton = document.getElementById('createTournamentButton');
    if (createTournamentButton) {
        createTournamentButton.addEventListener('click', function (event) {
            event.preventDefault();
            createTournament();
        });
    }
}

async function fetchAllUsers()
{
    try
    {
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
    catch (error)
    {
        console.error('Error:', error);
    }
}

function fetchTournamentState() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    const authToken = sessionStorage.getItem('authToken');

    fetch(`/api/tournament/${tournamentId}/state/`, {
        method: 'GET',
        headers: getRequestHeaders()
    })
        .then(response => {
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            return response.json();
        })
        .then(data => {
            console.log('Tournament state:', data);
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
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

function displayTournamentView() {

    const data = fetchTournamentState();
    if (data) {
        displayInviteContacts();
    }

}


function initTournament() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    const createState = sessionStorage.getItem('createState');
    if (createState === 'true' || !tournamentId) {
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