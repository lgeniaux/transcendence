
if (!window.allUsers) {
    window.allUsers = [];
}

function initFriendsSearch() {
    var input = document.getElementById('userSearch');
    if(input)
        input.addEventListener('input', filterUsersByUsername);

    fetchAllUsers();
}

function filterUsersByUsername(event) {
    const searchTerm = event.target.value

    const filteredUsers = allUsers.filter(user => user.username.includes(searchTerm));

    displayUsers(filteredUsers);
}

function fetchAllUsers() {
    var auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };
    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null') {
        headers['Authorization'] = 'Token ' + auth_token;
    }

    fetch('/api/get-users/', {
        method: 'GET',
        credentials: 'include',
        headers: headers
    })
        .then(response => response.json())
        .then(data => {
            allUsers = data;
            displayUsers(allUsers);
        }).catch(error => console.error('Error:', error));
}

function displayUsers(users) {
    var usersList = document.getElementById('users-list');
    usersList.innerHTML = '';

    users.forEach(user => {
        var avatarSrc = user.avatar;
        var actionContainerId = `actions-${user.username}`;
        
        var userHTML = `
            <div class="friend">
                <img src="${avatarSrc}" alt="User avatar" />
                <div>
                    <h2>${user.username}</h2>
                    <p>Status: <span id="status-${user.username}">${user.status}</span></p>
                </div>
                <div id="${actionContainerId}">
                    ${getActionButtonsHtml(user)}
                </div>
            </div>
        `;
        usersList.innerHTML += userHTML;
    });
}


function getActionButtonsHtml(user) {
    let buttonsHtml = '';
    if (user.status !== 'blocked') {
        buttonsHtml += `<button class="btn btn-danger" onclick="blockUser('${user.username}')">Block</button>`;
        if (user.status === 'friends') {
            buttonsHtml += `<button class="btn btn-danger" onclick="deleteFriend('${user.username}')">Delete</button>`;
        }
        else {
            buttonsHtml += `<button class="btn btn-success" onclick="addFriend('${user.username}')">Add</button>`;
        }
    }
    else {
        buttonsHtml += `<button class="btn btn-warning" onclick="unblockUser('${user.username}')">Unblock</button>`;
    }
    
    return buttonsHtml;
}

function blockUser(username) {
    var auth_token = sessionStoragege.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': 'Token ' + auth_token
    };

    const data = {
        username: username,
        action: "block"
    };

    fetch('api/block-user/', {
        method: 'POST',
        credentials: 'include',
        headers: headers,

        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            document.getElementById(`status-${username}`).textContent = 'blocked';
            document.getElementById(`actions-${username}`).innerHTML = getActionButtonsHtml({username: username, status: 'blocked'});
            console.log("User blocked successfully");
        } else {
            console.error('Failed to block user');
        }
    }
    )
    .catch(error => console.error('Error:', error));
}

function unblockUser(username) {
    var auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': 'Token ' + auth_token
    };

    const data = {
        username: username,
        action: "unblock"
    };

    fetch('api/unblock-user/', {
        method: 'POST',
        credentials: 'include',
        headers: headers,

        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            document.getElementById(`status-${username}`).textContent = 'not friends yet';
            document.getElementById(`actions-${username}`).innerHTML = getActionButtonsHtml({username: username, status: 'None'});
            console.log("User blocked successfully");
        } else {
            console.error('Failed to unblock user');
        }
    }
    )
    .catch(error => console.error('Error:', error));
}


function deleteFriend(friendUsername) {
    var auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': 'Token ' + auth_token
    };

    const data = {
        username: friendUsername,
        action: "delete"
    };

    fetch('api/delete-friend/', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            document.getElementById(`status-${friendUsername}`).textContent = 'not friends yet';
            document.getElementById(`actions-${friendUsername}`).innerHTML = getActionButtonsHtml({username: friendUsername, status: 'not friends yet'});
            console.log("Friend deleted successfully");
        } else {
            console.error('Failed to delete friend');
        }
    })
    .catch(error => console.error('Error:', error));
}


function addFriend(friendUsername) {
    var auth_token = sessionStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
        'Authorization': 'Token ' + auth_token
    };

    const data = {
        username: friendUsername,
        action: "add"
    };

    fetch('api/add-friend/', {
        method: 'POST',
        credentials: 'include',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            document.getElementById(`status-${friendUsername}`).textContent = 'friends';
            document.getElementById(`actions-${friendUsername}`).innerHTML = getActionButtonsHtml({username: friendUsername, status: 'friends'});
            console.log("Friend added successfully");
        } else {
            console.error('Failed to add friend');
        }
    })
    .catch(error => console.error('Error:', error));
}


function getCSRFToken() {
    let csrfToken = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken='.length) === 'csrftoken=') {
                csrfToken = decodeURIComponent(cookie.substring('csrftoken='.length));
                break;
            }
        }
    }
    return csrfToken;
}


// Notifications


function displayNotification(notification) {
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
    }).catch(error => console.error('Error fetching stored notifications:', error));
}

function initNotifications() {
    fetchAndDisplayStoredNotifications(); // Fetch and display stored notifications on page load

    const auth_token = sessionStorage.getItem('authToken');
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

