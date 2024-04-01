import { routes } from './routes.js';

export async function navigate(path)
{
    if (window.ws)
        window.ws.close();

    const finalPath = getRedirectPath(path);
    const route = routes[finalPath];

    if (!route)
    {
        console.error('Route not found:', finalPath);
        return;
    }

    if (window.location.pathname !== finalPath)
    {
        window.history.pushState({}, '', finalPath);
    }

    if (route.html)
        await loadHTML(route.html);
    if (route.css)
        await loadCSS(route.css);
    if (route.importmap)
        await loadImportmap(route.importmap);
    if (route.js) {
        try {
            if (Array.isArray(route.js)) {
                // Handle multiple scripts
                const imports = route.js.map(script => import(script));
                const modules = await Promise.all(imports);

                modules.forEach(module => {
                    if (module.init) module.init();
                });
            } else {
                // Handle a single script
                const module = await import(route.js);
                if (module.init) module.init();
            }
        } catch (error) {
            console.error('Error importing scripts:', error);
        }
    }
}

function getRedirectPath(path)
{
    if (!routes[path])
        return '/404';
    if ((path === '/' || path === '/login' || path === '/register') && isAuthenticated())
        return '/dashboard';
    if (routes[path].requires_auth && !isAuthenticated())
        return '/';
    return path;
}

export function handleNavigationClick(event)
{
    let target = event.target.closest('[data-spa]');

    if (target && target.dataset.spa) {
        event.preventDefault();

        let originalPath = target.dataset.spa;
        let finalPath = getRedirectPath(originalPath);

        if (originalPath === '/tournament' && target.dataset.spaId)
            sessionStorage.setItem('currentTournamentId', target.dataset.spaId);
        else if (originalPath === '/tournament' && !target.dataset.spaId)
            sessionStorage.removeItem('currentTournamentId');
        else if (originalPath === '/stats' && target.dataset.spaId)
            sessionStorage.setItem('currentStatsUsername', target.dataset.spaId);
        else if (originalPath === '/stats' && !target.dataset.spaId)
            sessionStorage.setItem('currentStatsUsername', 'me');

        navigate(finalPath);
    }
}

async function loadHTML(url)
{
    try
    {
        const response = await fetch(url);

        if (!response.ok)
            throw new Error(`Erreur HTTP: ${response.status}`);

        const html = await response.text();
        document.querySelector('#app').innerHTML = html;
    }
    catch (error)
    {
        console.error('Error loading the HTML file:', error);
    }
}


async function loadCSS(url)
{
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    head.appendChild(link);
}


async function loadModule(url)
{
    const module = document.createElement('script');
    module.src = url;
    module.type = 'module';
    document.body.appendChild(module);
}

async function loadImportmap() {
    // Check if an importmap is already loaded to avoid duplication
    if (!document.querySelector('script[type="importmap"]')) {
        return new Promise((resolve, reject) => {
            const importmap = document.createElement('script');
            importmap.type = 'importmap';
            importmap.textContent = JSON.stringify({
                imports: {
                    'three': 'https://unpkg.com/three@0.160.1/build/three.module.js',
                    'three/addons/': 'https://unpkg.com/three@0.160.1/examples/jsm/',
                },
            });
            importmap.onload = resolve;
            importmap.onerror = () => reject(new Error("Failed to load the import map."));
            document.head.appendChild(importmap);
        });
    }
    // If an importmap is already present, resolve immediately
    return Promise.resolve();
}


export function isAuthenticated()
{
    const authToken = sessionStorage.getItem('authToken');

    return authToken && authToken !== 'undefined' && authToken !== 'null';
}