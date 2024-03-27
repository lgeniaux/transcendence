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

