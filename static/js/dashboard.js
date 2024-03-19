// Notifications

function displayNotification(notification)
{
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        const dateString = new Date(notification.created_at).toLocaleString();

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
            </div>
        `;
        notificationsList.prepend(notificationElement);
    }
}


function fetchAndDisplayStoredNotifications()
{
    const auth_token = localStorage.getItem('authToken');
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
            displayNotification(notification);
        });
    }).catch(error => console.error('Error fetching stored notifications:', error));
}

function initNotifications() {
    fetchAndDisplayStoredNotifications(); // Fetch and display stored notifications on page load

    const auth_token = localStorage.getItem('authToken');
    const wsUrl = `ws://${window.location.host}/ws/notifications/${auth_token}/`;
    const webSocket = new WebSocket(wsUrl);

    webSocket.onmessage = function(event) {
        const notification = JSON.parse(event.data);
        console.log('Live notification:', notification);
        displayNotification(notification);
    }

    webSocket.onopen = function(event) {
        console.log('WebSocket opened');
    }

    webSocket.onclose = function(event) {
        console.log('WebSocket closed');
    }

    webSocket.onerror = function(event) {
        console.error('WebSocket error:', event);
    }
}

window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initNotifications);
// window.initPageFunctions.push(initTournamentsList);
window.initPageFunctions.push(initFriendsSearch);

