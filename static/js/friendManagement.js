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
        displayUsers(allUsers); // Assurez-vous que cette fonction est prête à gérer les données des utilisateurs.
    }
    catch (error)
    {
        console.error('Error:', error);
    }
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

async function handleUserAction(username, action)
{
    let statusAfterAction;

    switch (action)
	{
        case 'block':
            statusAfterAction = 'blocked';
            break;
        case 'unblock':
            statusAfterAction = 'none';
            break;
        case 'add':
            statusAfterAction = 'friends';
            break;
        case 'delete':
            statusAfterAction = 'not friends yet';
            break;
        default:
            console.error(`Unknown action: ${action}`);
            return;
    }

    try
	{
        await sendUserAction(username, action);
        console.log(`User ${action}ed successfully`);
        updateUserInterface(username, statusAfterAction);
        emitUserStatusChangeEvent(username, statusAfterAction);
    }
	catch (error)
	{
        console.error(`Error ${action}ing user ${username}:`, error);
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
