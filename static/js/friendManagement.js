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

function emitUserStatusChangeEvent(username, newStatus)
{
    const event = new CustomEvent('userStatusChange', { detail: { username, newStatus } });
    document.dispatchEvent(event);
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

async function sendUserAction(username, action)
{
    const headers = getRequestHeaders();
    const data = { username, action };

    const endpointMap =
	{
        "block": 'api/block-user/',
        "unblock": 'api/unblock-user/',
        "add": 'api/add-friend/',
        "delete": 'api/delete-friend/',
    };

    try
	{
        const response = await fetch(endpointMap[action], {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok)
            throw new Error(`Failed to ${action} user. Status: ${response.status}`);
        
        return await response.json(); // Assuming the API returns JSON.
    }
	catch (error)
	{
        console.error(`Error performing ${action} on user: ${username}`, error);
        throw error; // Re-throw to handle it outside or log it.
    }
}
async function blockUser(username) {
    try
	{
        await sendUserAction(username, 'block');
        console.log("User blocked successfully");
        updateUserInterface(username, 'blocked');
        emitUserStatusChangeEvent(username, 'blocked');
    }
	catch (error)
	{
        console.error(`Error blocking user ${username}:`, error);
    }
}

async function unblockUser(username)
{
    try
	{
        await sendUserAction(username, 'unblock');
        console.log("User unblocked successfully");
        updateUserInterface(username, 'none');
        emitUserStatusChangeEvent(username, 'none');
    }
	catch (error)
	{
        console.error(`Error unblocking user ${username}:`, error);
    }
}

async function addFriend(username)
{
    try
	{
        await sendUserAction(username, 'add');
        console.log("Friend added successfully");
        updateUserInterface(username, 'friends');
        emitUserStatusChangeEvent(username, 'friends');
    }
	catch (error)
	{
        console.error(`Error adding friend ${username}:`, error);
    }
}

async function deleteFriend(username)
{
    try
	{
        await sendUserAction(username, 'delete');
        console.log("Friend deleted successfully");
        updateUserInterface(username, 'not friends yet');
        emitUserStatusChangeEvent(username, 'not friends yet');
    }
	catch (error)
	{
        console.error(`Error deleting friend ${username}:`, error);
    }
}

function updateUserInterface(username, newStatus)
{
    const statusTexts = {
        'blocked': 'blocked',
        'none': 'not friends yet',
        'friends': 'friends',
        'not friends yet': 'not friends yet'
    };

    const statusText = statusTexts[newStatus] || 'unknown';
    document.getElementById(`status-${username}`).textContent = statusText;
    document.getElementById(`actions-${username}`).innerHTML = getActionButtonsHtml({username: username, status: newStatus});
}
