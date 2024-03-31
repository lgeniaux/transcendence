"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transcendence.settings")
django.setup()



from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import livechat.routing
import notifications.routing
import tournaments.routing
import games.routing

websocket_urlpatterns = (
    livechat.routing.websocket_urlpatterns
    + notifications.routing.websocket_urlpatterns
    + tournaments.routing.websocket_urlpatterns
    + games.routing.websocket_urlpatterns
)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})

websocket_urlpatterns = (
    livechat.routing.websocket_urlpatterns
    + notifications.routing.websocket_urlpatterns
    + tournaments.routing.websocket_urlpatterns
    + games.routing.websocket_urlpatterns
)

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
