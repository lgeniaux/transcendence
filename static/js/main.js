// main.js

const routes = {
    '/': {
        html: '/static/html/home.html',
		css: '/static/css/home.css',
    },
    '/login': {
        html: '/static/html/login.html',
        css: '/static/css/auth/auth.css',
        js: '/static/js/login.js'
    },
    '/register': {
        html: '/static/html/register.html',
        css: '/static/css/auth/auth.css',
        js: '/static/js/register.js'
    }
};


document.addEventListener('DOMContentLoaded', function() {
    navigate(window.location.pathname);

    window.addEventListener('popstate', function() {
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
document.addEventListener('click', function(event) {
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

    loadHTML(route.html);
    if (route.css)
        loadCSS(route.css);
    if (route.js)
        loadJS(route.js, function() {
            if (typeof window.initPage === 'function') {
                window.initPage();
            }
        });
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

function loadJS(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = false;
    script.onload = callback;
    document.body.appendChild(script);
}

function isAuthenticated() {
    const authToken = localStorage.getItem('authToken');
    return authToken && authToken !== 'undefined' && authToken !== 'null';
}


