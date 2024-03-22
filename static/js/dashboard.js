
if (!window.allUsers) {
    window.allUsers = [];
}

function initFriendsSearch() {
    var input = document.getElementById('userSearch');
    if (input)
        input.addEventListener('input', filterUsersByUsername);

    fetchAllUsers();
}

function filterUsersByUsername(event) {
    const searchTerm = event.target.value

    const filteredUsers = allUsers.filter(user => user.username.includes(searchTerm));

    displayUsers(filteredUsers);
}

// Notifications
function manageInvite(notificationId, action) {
    const auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${auth_token}`
    };

    fetch('/api/respond-to-invite/', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify({ notification_id: notificationId, action: action })
    })
        .then(response => response.json())
        .then(data => {
            // if http code is 200, then the invite was accepted/rejected and can be removed from the UI
            console.log('Response to invite:', data);
            if (data.detail === 'Tournament invitation successfully accepted' | data.detail === 'Tournament invitation successfully denied') {
                const notificationElement = document.querySelector(`.notification[data-notification-id="${notificationId}"]`);
                if (notificationElement) {
                    notificationElement.remove();
                }
            }
            if (data.detail === 'Tournament invitation successfully accepted') {
                // display the card of the tournament
                fetchAndDisplayTournaments();
            }
        }).catch(error => console.error('Error responding to invite:', error));
}



function getActionButtonsNotification(notification) {
    if (notification.notification_type === 'tournament-invite') {
        return `
            <button class="btn btn-danger" onclick="manageInvite(${notification.id}, 'reject')">Reject</button>
            <button class="btn btn-success" onclick="manageInvite(${notification.id}, 'accept')">Accept</button>
            `;
    }
}

function displayNotification(notification) {
    const notificationsList = document.querySelector('.notifications-list');

    if (notificationsList) {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        const dateString = new Date(notification.created_at).toLocaleString();
        notificationElement.setAttribute('data-notification-id', notification.id);
        notificationElement.innerHTML = `
            <div class="notification-card">
                <div class="notification-header">
                    <span class="notification-type">${notification.notification_type.replace('-', ' ')}</span>
                    <span class="notification-date">${dateString}</span>
                </div>
                <div class="notification-body">
                    <p>${notification.message}</p>
                    <p>From: <strong>${notification.data.sender_username}</strong></p>
                    <p>Tournament: <strong>${notification.data.tournament_name}</strong> (ID: ${notification.data.tournament_id})</p>
                </div>
                <div class="notification-actions">
                    ${getActionButtonsNotification(notification)}
                </div>
            </div>
        `;
        notificationsList.prepend(notificationElement);
    }
}


function fetchAndDisplayStoredNotifications() {
    const auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${auth_token}`
    };

    fetch('/api/get-notifications/', { // Ensure you have an endpoint to fetch stored notifications
        method: 'GET',
        credentials: 'include',
        headers: headers
    })
        .then(response => response.json())
        .then(data => {
            // Assuming data is an array of notifications
            data.forEach(notification => {
                if (notification.data['invite_status'] === 'pending') {
                    displayNotification(notification);
                }
            });
        }).catch(error => console.error('Error fetching notifications:', error));
}

function initNotifications() {
    fetchAndDisplayStoredNotifications(); // Fetch and display stored notifications on page load

    const auth_token = sessionStorage.getItem('authToken');
    const wsUrl = `ws://${window.location.host}/ws/notifications/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);

    webSocket.onmessage = function (event) {
        const notification = JSON.parse(event.data);
        console.log('Live notification:', notification);
        displayNotification(notification);
    }

    webSocket.onopen = function (event) {
        console.log('WebSocket opened');
    }

    webSocket.onclose = function (event) {
        console.log('WebSocket closed');
    }

    webSocket.onerror = function (event) {
        console.error('WebSocket error:', event);
    }
}

function displayTournaments(tournaments) {
    const tournamentsList = document.querySelector('.tournaments-list');
    //clear the list
    tournamentsList.innerHTML = '';
    if (tournamentsList) {
        tournaments.forEach(tournament => {
            const tournamentElement = document.createElement('div');
            //<div class="tournament-card" type="button" data-spa="/tournament" data-spa-id="8">
            tournamentElement.className = 'tournament';
            tournamentElement.setAttribute('type', 'button');
            tournamentElement.setAttribute('data-spa', '/tournament');
            tournamentElement.setAttribute('data-spa-id', tournament.id);
            tournamentElement.innerHTML = `
                    <h3>${tournament.name}</h3>
                    <span class="tournament-state">${tournament.state.status}</span>
                `;
            tournamentsList.appendChild(tournamentElement);
        }
        );
    }
}

function fetchAndDisplayTournaments() {
    const auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${auth_token}`
    };
    fetch('/api/tournament/get-tournaments/', {
        method: 'GET',
        credentials: 'include',
        headers: headers
    })
        .then(response => response.json())
        .then(data => {
            console.log('Tournaments:', data);
            displayTournaments(data);
        }).catch(error => console.error('Error fetching tournaments:', error));
}

function initTournamentsList() {
    fetchAndDisplayTournaments();
}







window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initNotifications);
window.initPageFunctions.push(initFriendsSearch);
window.initPageFunctions.push(initTournamentsList);

