// main.js

const routes = {
    '/': {
        html: '/static/html/home.html',
        css: '/static/css/home.css',
    },
    '/login': {
        html: '/static/html/auth/login.html',
        css: '/static/css/auth/auth.css',
        js: ['/static/js/oauth.js', '/static/js/login.js']
    },
    '/register': {
        html: '/static/html/auth/register.html',
        css: '/static/css/auth/auth.css',
        js: '/static/js/register.js'
    },
    '/oauth_callback': {
        html: '/static/html/oauth_callback.html',
        js: '/static/js/oauth.js'
    },
    '/profile': {
        html: '/static/html/profile.html',
        css: '/static/css/profile.css',
        js: '/static/js/profile.js',
        requires_auth: true
    },
    '/duel': {
        html: '/static/game/import.html',
        module: '/static/js/game.js',
        importmap: true,
        css: '/static/css/game.css',
        requires_auth: true
    },
    '/dashboard': {
        html: '/static/html/dashboard.html',
        css: '/static/css/dashboard.css',
        js: '/static/js/dashboard.js',
        requires_auth: true
    },
    '/tournament': {
        html: '/static/html/tournament.html',
        css: '/static/css/tournament.css',
        js: '/static/js/tournament.js',
        requires_auth: true
    }
};


document.addEventListener('DOMContentLoaded', function () {
    navigate(window.location.pathname);

    window.addEventListener('popstate', function () {
        navigate(window.location.pathname);
    });

    // Vincent: Pour charger la barre de navigation
    loadNavbar();
});


function getRedirectPath(path) {
    if ((path === '/login' || path === '/register') && isAuthenticated()) {
        console.log('Authenticated user. Redirecting to home...');
        return '/'; // Return the home path for redirection
    }
    if (routes[path].requires_auth && !isAuthenticated()) {
        console.log('Redirecting to login due to authentication requirement');
        return '/'; // Redirect to home
    }
    return path;
}

// navigate to the page if a button is clicked, the location of the navigation is stored in the data-spa. example: <button data-spa="/login">Login</button>
document.addEventListener('click', function (event) {
    if (event.target.dataset.spa) {
        event.preventDefault();

        let originalPath = event.target.dataset.spa;
        let finalPath = getRedirectPath(originalPath);

        navigate(finalPath);
        window.history.pushState({}, '', finalPath);
    }
});

function isAuthenticated() {
    const authToken = localStorage.getItem('authToken');
    return authToken && authToken !== 'undefined' && authToken !== 'null';
}

function navigate(path) {
    window.initPageFunctions = [];
    // Louis: On  redirecte l'utilisateur vers la page d'accueil si il est déjà connecté
    let finalPath = getRedirectPath(path);

    const route = routes[finalPath];
    if (!route) {
        console.error('Route not found');
        return;
    }

    if (route.html)
        loadHTML(route.html);
    if (route.css)
        loadCSS(route.css);
    if (route.js) {
        const scripts = Array.isArray(route.js) ? route.js : [route.js];
        // on delete toutes les balises script avec le type: text/javascript
        document.querySelectorAll('script[type="text/javascript"]').forEach(script => script.remove());
        loadJS(scripts, function () {
            // Execute all init functions
            if (Array.isArray(window.initPageFunctions)) {
                window.initPageFunctions.forEach(function (initFunction) {
                    if (typeof initFunction === 'function') {
                        initFunction();
                    }
                });
            }
        });
    }

    if (route.importmap)
        loadImportmap(route.importmap);
    if (route.module)
        loadModule(route.module);
}

function loadHTML(url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.querySelector('#app').innerHTML = html;
        })
        .catch(error => console.error('Error loading the HTML file:', error));
}

function loadCSS(url) {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    head.appendChild(link);
}

function loadJS(urls, finalCallback) {
    let loadedScripts = 0;
    urls.forEach((url) => {
        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.async = false;
        script.onload = () => {
            loadedScripts++;
            if (loadedScripts === urls.length && finalCallback) {
                finalCallback(); // All scripts loaded
            }
        };
        document.body.appendChild(script);
    });
}

function loadModule(url) {
    const module = document.createElement('script');
    module.src = url;
    module.type = 'module';
    module.async = false;
    document.body.appendChild(module);
}

function loadImportmap() {
    if (document.querySelector('script[type="importmap"]'))
        return;
    const importmap = document.createElement('script');
    importmap.type = 'importmap';
    importmap.innerHTML = JSON.stringify({
        imports: {
            'three': 'https://unpkg.com/three@0.160.1/build/three.module.js',
            'three/addons/': 'https://unpkg.com/three@0.160.1/examples/jsm/',
        },
    });
    importmap.async = false;
    document.head.appendChild(importmap);
}

// Vincent: Fonctions pour charger la barre de navigation et la chatbox, à modifier pour qu'elle soient affichées en fonction du token
function loadNavbar() {
    const sidePanelUrl = '/static/html/navbar/sidepanel.html';
    const profileModalUrl = '/static/html/navbar/profilemodal.html';


    fetch(sidePanelUrl)
        .then(response => response.text())
        .then(html => {
            document.querySelector('#sidePanel').innerHTML = html;
        })
        .catch(error => console.error('Erreur lors du chargement de la barre de navigation :', error));

    fetch(profileModalUrl)
        .then(response => response.text())
        .then(html => {
            document.querySelector('#profileModal').innerHTML = html;
        })
        .catch(error => console.error('Erreur lors du chargement du bouton de profil :', error));
}
