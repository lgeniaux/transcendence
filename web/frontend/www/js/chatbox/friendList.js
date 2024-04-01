import { getRequestHeaders, revokeAuthToken } from '../utils.js';

export async function loadFriendList()
{
    try
    {
        const users = await cb_fetchAllUsers();
        await cb_displayUsers(users);
        attachClickEventToFriends();
        document.getElementById('chatboxHeader').innerText = 'Chat';
    }
    catch (error)
    {
        console.error("Error loading friend list:", error);
    }
}

window.loadFriendList = loadFriendList;

async function cb_fetchAllUsers()
{
    try
    {
        const response = await fetch('/api/get-users/', {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders()
        });

        if (!response.ok)
        {
            if (response.status === 401)
            {
                const data = await response.json();

                if (data.detail === 'Invalid token.')
                    revokeAuthToken();
            }

            throw new Error('Error fetching users');
        }

        const data = await response.json();

        return data;
    }
    catch (error)
    {
        throw error;
    }
}

async function cb_displayUsers(users)
{
    let usersList = document.getElementById('chatboxContainer');
    usersList.innerHTML = '';

    users.sort((a, b) => b.online_status - a.online_status);

    if (users.length === 0) {
        usersList.innerHTML = "<p>You have no friends (yet :P)</p>";
        return;
    }

    users.forEach(user => {
        const userHtml = getUserHtml(user);
        displayUser(userHtml, usersList);
    });
}

function displayUser(userHtml, usersList)
{
    usersList.innerHTML += userHtml;
}

function getUserHtml(user)
{
    const dropdownId = `dropdown-${user.username}`;
    const avatarSrc = user.avatar ? user.avatar : '/media/zippy.jpg'
    const onlineStatusClass = user.online_status ? 'bg-success' : 'bg-danger';
    const onlineStatusText = user.online_status ? 'Online' : 'Offline';

    return `
        <button class="user dropdown-toggle" type="button" data-username="${user.username}" data-bs-toggle="dropdown" aria-expanded="false" id="${dropdownId}">
            <div id="profilePicture"><img src="${avatarSrc}" alt="User avatar" class="avatar"></div>
            <div>${user.username}</div>
            <span class="badge ${onlineStatusClass}">${onlineStatusText}</span>
        </button>
        <div class="dropdown-menu dropdown-menu-end action-buttons-container" aria-labelledby="${dropdownId}">
            ${getChatboxActionButtonsHtml(user)}
        </div>
    `;
}

window.viewProfile = function(username)
{
    if (username)
    {
        sessionStorage.setItem('currentStatsUsername', username);
        window.location.href = '/stats';
    }
}

function getChatboxActionButtonsHtml(user, actionContainerId)
{
    let buttonsHtml = `<div id="${actionContainerId}">`;

    if (user.status === 'friends')
    {
        buttonsHtml += `<a class="dropdown-item" onclick="window.loadMessageBox('${user.username}')">Send message</a>`;
        buttonsHtml += `<a class="dropdown-item" onclick="window.viewProfile('${user.username}')">See stats page</a>`;
        buttonsHtml += `<a class="dropdown-item" onclick="startGameWithUser('${user.username}')">Invite to 1v1</a>`;
        buttonsHtml += `<hr>`
        buttonsHtml += `<a class="dropdown-item dangerBtn" onclick="window.handleUserAction('${user.username}', 'delete')">Delete</a>`;
    }
    else if (user.status === 'blocked')
        buttonsHtml += `<a class="dropdown-item dangerBtn" onclick="window.handleUserAction('${user.username}', 'unblock')">Unblock</a>`;
    else
    { 
        buttonsHtml += `<a class="dropdown-item" onclick="window.handleUserAction('${user.username}', 'add')">Add contact</a>`;
        buttonsHtml += `<a class="dropdown-item dangerBtn" onclick="window.handleUserAction('${user.username}', 'block')">Block</a>`;
    }

    buttonsHtml += '</div>';

    return buttonsHtml;
}

function attachClickEventToFriends()
{
    document.querySelectorAll('.user').forEach(userElement => {
        userElement.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown-menu'))
            {
                const username = this.getAttribute('data-username');
                window.targetUsername = username;
            }
        });
    });
}
