// main.js

const routes = {
    '/': {
        html: '/static/html/home.html',
        css: '/static/css/home.css',
    },
    '/login': {
        html: '/static/html/login.html',
        css: '/static/css/auth/auth.css',
        js: ['/static/js/login.js', '/static/js/oauth.js']
    },
    '/register': {
        html: '/static/html/register.html',
        css: '/static/css/auth/auth.css',
        js: ['/static/js/register.js']
    },
    '/oauth_callback': {
        html: '/static/html/oauth_callback.html',
        js: '/static/js/oauth.js'
    },
    '/profile': {
        html: '/static/html/profile.html',
		css: '/static/css/profile.css',
        js: '/static/js/profile.js'
    },
};


document.addEventListener('DOMContentLoaded', function () {
    navigate(window.location.pathname);

    window.addEventListener('popstate', function () {
        navigate(window.location.pathname);
    });
});


function getRedirectPath(path) {
    if ((path === '/login' || path === '/register') && isAuthenticated()) {
        console.log('Authenticated user. Redirecting to home...');
        return '/'; // Return the home path for redirection
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

function navigate(path) {
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
        loadJS(scripts, function () {
            if (typeof window.initPage === 'function') {
                window.initPage();
            }
        });
    }
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

function isAuthenticated() {
    const authToken = localStorage.getItem('authToken');
    return authToken && authToken !== 'undefined' && authToken !== 'null';
}


