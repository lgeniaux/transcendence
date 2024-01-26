from django.shortcuts import render, redirect
from .models import Message

def chat_view(request):
    messages = Message.objects.all().order_by('timestamp')
    return render(request, 'livechat/chat.html', {'messages': messages})

def post_message(request):
    if request.method == 'POST':
        content = request.POST.get('content')
        if content:
            Message.objects.create(author=request.user, content=content)
    return redirect('chat')