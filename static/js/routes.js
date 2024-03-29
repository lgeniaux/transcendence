export const routes = {
    '/': {
        html: '/static/home.html',
        css: '/static/home.css',
    },
    '/login': {
        html: '/static/routes/auth/login.html',
        css: '/static/routes/auth/auth.css',
        js: ['/static/routes/auth/oauth.js', '/static/routes/auth/login.js']
    },
    '/register': {
        html: '/static/routes/auth/register.html',
        css: '/static/routes/auth/auth.css',
        js: '/static/routes/auth/register.js'
    },
    '/oauth_callback': {
        html: '/static/routes/auth/oauth_callback.html',
        js: '/static/routes/auth/oauth.js'
    },
    '/profile': {
        html: '/static/routes/profile/profile.html',
        css: '/static/routes/profile/profile.css',
        js: '/static/routes/profile/profile.js',
        requires_auth: true
    },
    '/duel': {
        html: '/static/game/import.html',
        js: '/static/js/duel.js',
        importmap: true,
        css: '/static/css/game.css',
        requires_auth: true
    },
    '/dashboard': {
        html: '/static/routes/dashboard/dashboard.html',
        css: '/static/routes/dashboard/dashboard.css',
        js: '/static/routes/dashboard/dashboard.js',
        requires_auth: true
    },
    '/tournament': {
        html: '/static/routes/tournament/tournament.html',
        css: '/static/routes/tournament/tournament.css',
        js: '/static/routes/tournament/tournament.js',
        requires_auth: true
    },
    '/game': {
        html: '/static/html/game/game.html',
        js: '/static/js/game/game.js',
        importmap: true,
        css: '/static/css/game.css',
        requires_auth: true
    },
    '/stats': {
        html: '/static/routes/stats/stats.html',
        css: '/static/routes/stats/stats.css',
        js: '/static/routes/stats/stats.js',
        requires_auth: true
    },
    '/404': {
        html: '/static/html/404.html',
        css: '/static/css/404.css',
        requires_auth: false
    }
};
