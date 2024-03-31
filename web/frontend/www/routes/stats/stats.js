async function fetchStats()
{
    try{
        const username = sessionStorage.getItem('currentStatsUsername');
        if (!username) throw new Error('No username provided');
        const response = await fetch(`/api/stats/${username}/fetch/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${sessionStorage.getItem('authToken')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    }
    catch(error){
        console.error(error);
    }
}

export async function init()
{
    const stats = await fetchStats();
}