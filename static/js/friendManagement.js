if (!window.allUsers)
{
    window.allUsers = [];
}

function initFriendsSearch()
{
    var input = document.getElementById('userSearch');

    if(input)
        input.addEventListener('input', filterUsersByUsername);

    fetchAllUsers();
}

function filterUsersByUsername(event)
{
    const searchTerm = event.target.value

    const filteredUsers = allUsers.filter(user => user.username.includes(searchTerm));

    displayUsers(filteredUsers);
}

function fetchAllUsers()
{
    var auth_token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
    };

    if (auth_token && auth_token !== 'undefined' && auth_token !== 'null')
        headers['Authorization'] = 'Token ' + auth_token;

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

function displayUsers(users)
{
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

function getActionButtonsHtml(user)
{
    let buttonsHtml = '';
    if (user.status !== 'blocked')
	{
        buttonsHtml += `<button class="btn btn-danger" onclick="blockUser('${user.username}')">Block</button>`;

        if (user.status === 'friends')
            buttonsHtml += `<button class="btn btn-danger" onclick="deleteFriend('${user.username}')">Delete</button>`;
        else
            buttonsHtml += `<button class="btn btn-success" onclick="addFriend('${user.username}')">Add</button>`;
    }
    else
        buttonsHtml += `<button class="btn btn-warning" onclick="unblockUser('${user.username}')">Unblock</button>`;
    
    return buttonsHtml;
}

function blockUser(username)
{
    var auth_token = localStorage.getItem('authToken');
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

function unblockUser(username)
{
    var auth_token = localStorage.getItem('authToken');
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

function addFriend(friendUsername)
{
    var auth_token = localStorage.getItem('authToken');
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

function deleteFriend(friendUsername)
{
    var auth_token = localStorage.getItem('authToken');
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
