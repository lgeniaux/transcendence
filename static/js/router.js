class Router {
    constructor(routes) {
        this.routes = routes;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.handleHashChange(); // Handle the initial load
    }

    async handleHashChange() {
        const hash = location.hash.slice(1); // Remove the '#' part
        const route = this.routes[hash] || this.routes['404'];
        this.loadContent(route);
    }

    async loadContent({templateUrl, scriptUrl, styleUrl}) {
        const contentDiv = document.getElementById('app');

        // Load the HTML template
        const response = await fetch(templateUrl);
        contentDiv.innerHTML = await response.text();

        // // Dynamically load the CSS
        // if (styleUrl) {
        //     const link = document.createElement('link');
        //     link.href = styleUrl;
        //     link.type = 'text/css';
        //     link.rel = 'stylesheet';
        //     document.head.appendChild(link);
        // }

        // Dynamically load the JS
        if (scriptUrl) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            document.body.appendChild(script);
        }
    }
}

const router = new Router({
    'login': {
        templateUrl: 'frontend/templates/authentication/login.html',
        scriptUrl: 'static/js/login.js',
        styleUrl: 'static/css/login.css'
    },
    'register': {
        templateUrl: 'frontend/templates/authentication/register.html',
        scriptUrl: 'static/js/register.js',
        styleUrl: 'static/css/register.css'
    },
    '404': {
        templateUrl: 'frontend/templates/404.html',
    }

});

