


async function fetchStats()
{
    ///api/profile/stats/?username=
    const username = sessionStorage.getItem('currentUsername');
    const url = `/api/profile/stats/?username=${username}`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: getRequestHeaders()
    });

    if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log(data);

    if (data.error)
    {
        console.error(data.error);
        return;
    }

}

export async function init()
{
    await fetchStats();
}