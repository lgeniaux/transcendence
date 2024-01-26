from django.shortcuts import render
from .models import Message

def chat_view(request):
    """
    Cette vue gère l'affichage de la chat-box.
    Elle récupère tous les messages depuis la base de données et les passe au template.
    """
    # Récupérer les messages depuis la base de données, par exemple les 50 derniers messages
    messages = Message.objects.all().order_by('-timestamp')[:50]
    
    # Si vous souhaitez inverser l'ordre pour que les plus récents soient en haut, vous pouvez faire:
    messages = reversed(messages)
    
    # Retourne la réponse HTTP avec le template chargé et les messages passés en contexte
    return render(request, 'livechat/chat.html', {'messages': messages})