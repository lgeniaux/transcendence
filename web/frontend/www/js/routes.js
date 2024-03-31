export const routes = {
    '/': {
        html: '/frontend/www/home.html',
        css: '/frontend/www/home.css',
    },
    '/login': {
        html: '/frontend/www/routes/auth/login.html',
        css: '/frontend/www/routes/auth/auth.css',
        js: ['/frontend/www/routes/auth/oauth.js', '/frontend/www/routes/auth/login.js']
    },
    '/register': {
        html: '/frontend/www/routes/auth/register.html',
        css: '/frontend/www/routes/auth/auth.css',
        js: '/frontend/www/routes/auth/register.js'
    },
    '/oauth_callback': {
        html: '/frontend/www/routes/auth/oauth_callback.html',
        js: '/frontend/www/routes/auth/oauth.js'
    },
    '/profile': {
        html: '/frontend/www/routes/profile/profile.html',
        css: '/frontend/www/routes/profile/profile.css',
        js: '/frontend/www/routes/profile/profile.js',
        requires_auth: true
    },
    '/duel': {
        html: '/frontend/www/game/import.html',
        js: '/frontend/www/js/duel.js',
        importmap: true,
        css: '/frontend/www/css/game.css',
        requires_auth: true
    },
    '/dashboard': {
        html: '/frontend/www/routes/dashboard/dashboard.html',
        css: '/frontend/www/routes/dashboard/dashboard.css',
        js: '/frontend/www/routes/dashboard/dashboard.js',
        requires_auth: true
    },
    '/tournament': {
        html: '/frontend/www/routes/tournament/tournament.html',
        css: '/frontend/www/routes/tournament/tournament.css',
        js: '/frontend/www/routes/tournament/tournament.js',
        requires_auth: true
    },
    '/game': {
        html: '/frontend/www/html/game/game.html',
        js: '/frontend/www/js/game/game.js',
        importmap: true,
        css: '/frontend/www/css/game.css',
        requires_auth: true
    },
    '/stats': {
        html: '/frontend/www/routes/stats/stats.html',
        css: '/frontend/www/routes/stats/stats.css',
        js: '/frontend/www/routes/stats/stats.js',
        requires_auth: true
    },
    '/404': {
        html: '/frontend/www/html/404.html',
        css: '/frontend/www/css/404.css',
        requires_auth: false
    }
};
