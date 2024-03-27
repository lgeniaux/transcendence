// main.js

import { routes } from './routes.js';
import { navigate, handleNavigationClick, isAuthenticated } from './navigations.js';
import { loadNavbar } from './navbar.js';
import { loadChatbox } from './chatbox.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (isAuthenticated()) {
        await loadNavbar();
        await loadChatbox();
    }
    navigate(window.location.pathname);

    window.addEventListener('popstate', () => {
        navigate(window.location.pathname);
    });
});

// Ensure handleNavigationClick is correctly imported and used.
document.addEventListener('click', handleNavigationClick);