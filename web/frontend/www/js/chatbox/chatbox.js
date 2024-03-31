import { loadContent } from '../utils.js';
import { loadFriendList } from './friendList.js';
import { initWebsocket } from './webSocketCommunication.js';


export async function loadChatbox()
{
    try
    {
        await loadContent('/frontend/www/html/chatbox/chatbox.html', '#chatBox');
        await loadFriendList();
        initWebsocket();
        attachChatboxEvents();
    }
    catch (error)
    {
        console.error('Erreur lors du chargement de la chatbox :', error);
    }
}

function attachChatboxEvents()
{
    const chatboxCollapse = document.getElementById('chatboxCollapse');

    if (chatboxCollapse)
    {
        chatboxCollapse.addEventListener('show.bs.collapse', async function () {
            loadFriendList();
            try
            {
                await loadFriendList();
                console.log('Chatbox ouverte');
            }
            catch (error)
            {
                console.error('Erreur lors du chargement de la liste d’amis:', error);
            }
        });

        chatboxCollapse.addEventListener('hide.bs.collapse', function () {
            console.log('Chatbox fermée');
        });
    }
}

document.addEventListener('userStatusChange', async (event) => {
    const { username, newStatus } = event.detail;
    // Vous pourriez avoir besoin de récupérer à nouveau les données de l'utilisateur ici
    // Pour l'exemple, on va simplement rafraîchir toute la liste d'amis
    await loadFriendList();
});

window.startGameWithUser = async (username)=>{
    const authToken = sessionStorage.getItem('authToken');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
    };
    const data = { username: username };

    fetch('/api/game/invite/', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }).then(response => {
        return response.json();
    }).then(data => {
        console.log(data);
    });

}
