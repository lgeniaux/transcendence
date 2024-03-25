# Create your views here.
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def broadcast_to_tournament_group(tournament_id, message):
    channel_layer = get_channel_layer()
    group_name = f'tournament_{tournament_id}'
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'tournament.update',  # Matches the method name in the consumer
            'message': message
        }
    )