import { getRequestHeaders } from '../utils.js';
import { updateDashboardInterface } from '../../routes/dashboard/dashboard.js'
import { updateTournamentInterface } from '../../routes/tournament/tournament.js'

export async function handleUserAction(username, action)
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
            statusAfterAction = 'None';
            break;
        default:
            console.error(`Unknown action: ${action}`);
            return;
    }

    try
    {
        await sendUserAction(username, action);
        if (window.location.pathname === '/tournament')
            updateTournamentInterface(username, statusAfterAction);
        else
            updateDashboardInterface(username, statusAfterAction);
        emitUserStatusChangeEvent(username, statusAfterAction);
    }
    catch (error)
    {
        alert(`Error ${action}ing user ${username}: ` + error);
    }
}

window.handleUserAction = handleUserAction;

async function sendUserAction(username, action)
{
    const headers = getRequestHeaders();
    const data = { username, action };

    const endpointMap = {
        "block": 'api/block-user/',
        "unblock": 'api/unblock-user/',
        "add": 'api/add-friend/',
        "delete": 'api/delete-friend/',
    };

    const response = await fetch(endpointMap[action], {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(data)
    });

    if (!response.ok)
        throw new Error(`Failed to ${action} user. Status: ${response.status}`);
    
    return await response.json();
}

async function emitUserStatusChangeEvent(username, newStatus)
{
    const event = new CustomEvent('userStatusChange', { detail: { username, newStatus } });
    document.dispatchEvent(event);
}
