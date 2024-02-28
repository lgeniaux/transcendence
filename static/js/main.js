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

// navigate to the page if a button is clicked, the location of the navigation is stored in the data-spa. example: <button data-spa="/login">Login</button>
document.addEventListener('click', function(event) {
    if (event.target.dataset.spa) {
        event.preventDefault();
        navigate(event.target.dataset.spa);
        window.history.pushState(null, null, event.target.dataset.spa);
    }
}
);

document.addEventListener('DOMContentLoaded', function() {
    navigate(window.location.pathname);

    window.addEventListener('popstate', function() {
        navigate(window.location.pathname);
    });
});

function navigate(path) {
    const route = routes[path];
    if (!route) {
        console.error('Route not found');
        return;
    }

    loadHTML(route.html);
    if (route.css)
        loadCSS(route.css);
    if (route.js)
        loadJS(route.js);
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

function loadJS(url) {
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = false; // This ensures the script is executed in the order it was called
    document.body.appendChild(script);
}
