
let allUsers = [];

function initFriendsSearch() {
    document.getElementById('userSearch').addEventListener('input', filterUsersByUsername);
    fetchAllUsers();
}

function filterUsersByUsername(event) {
    const searchTerm = event.target.value

    const filteredUsers = allUsers.filter(user => user.username.includes(searchTerm));

    displayUsers(filteredUsers);
}

function fetchAllUsers() {
    var auth_token = localStorage.getItem('authToken');
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
        var userHTML = `
            <div class="friend">
                <img src="${avatarSrc}" alt="User avatar" />
                <div>
                    <h2>${user.username}</h2>
                </div>
                <button class="btn btn-primary" onclick="addFriend(${user.id})">Add Friend</button>
            </div>
        `;
        usersList.innerHTML += userHTML;
    });
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

window.initPageFunctions = window.initPageFunctions || [];
// window.initPageFunctions.push(initNotifications);
// window.initPageFunctions.push(initTournamentsList);
window.initPageFunctions.push(initFriendsSearch);

