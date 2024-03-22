

function initTournament() {
    const tournamentId = sessionStorage.getItem('currentTournamentId');
    if (!tournamentId) {
        console.error('Tournament ID not found');
        window.location.href = '/dashboard';
    }

    const authToken = sessionStorage.getItem('authToken');
    const ws = new WebSocket(`ws://${window.location.host}/ws/tournament/${authToken}/${tournamentId}/`);

    ws.onopen = function(event) {
        console.log('WebSocket opened');
    }

    ws.onclose = function(event) {
        console.log('WebSocket closed');
    }

    ws.onerror = function(event) {
        console.error('WebSocket error:', event);
    }

    ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        console.log('Live message:', message);
        // Handle the message here
    }
}



window.initPageFunctions = window.initPageFunctions || [];
window.initPageFunctions.push(initTournament);