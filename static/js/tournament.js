if (!window.allUsers) {
    window.allUsers = [];
}

function displayCreateTournamentForm() {
    // in the html there is a div : <div class="modal show d-block" id="createTournamentOverlay" tabindex="-1" aria-labelledby="createTournamentOverlayLabel" aria-modal="true" role="dialog">
    const createTournamentOverlay = document.getElementById('createTournamentOverlay');
    if (createTournamentOverlay) {
        createTournamentOverlay.classList.add('show');
        createTournamentOverlay.classList.add('d-block');
    }
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.classList.add('show');
    }

}

function createTournament() {
    const authToken = sessionStorage.getItem('authToken');
    const tournamentName = document.getElementById('tournamentNameInput').value;
    const nb_players_option = document.getElementById('numberOfPlayers');
    const nb_players = nb_players_option.options[nb_players_option.selectedIndex].value;

    const data = {
        name: tournamentName,
        nb_players: nb_players
    };

    fetch('/api/tournament/create-tournament/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create tournament');
            }
            return response.json();
        })
        .then(data => {
            console.log('Tournament created:', data);
            sessionStorage.setItem('currentTournamentId', data.tournament_id);
            sessionStorage.removeItem('createState');
            window.location.reload();
        })
        .catch(error => {
            console.error('Failed to create tournament:', error);
        });
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

function initTournament() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    const createState = sessionStorage.getItem('createState');
    if (createState === 'true' || !tournamentId) {
        displayCreateTournamentForm();
        initTournamentCreateButton();

    }
    else
    {
        const authToken = sessionStorage.getItem('authToken');
        const ws = new WebSocket(`ws://${window.location.host}/ws/tournament/${authToken}/${tournamentId}/`);

        ws.onopen = function (event) {
            console.log('WebSocket opened');
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