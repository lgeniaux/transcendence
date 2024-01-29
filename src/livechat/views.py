import logging
from django.http import JsonResponse

from django.shortcuts import render, redirect
from .models import Message
from django.contrib.auth.decorators import login_required

def chat_view(request):
    messages = Message.objects.all().order_by('timestamp')
    return render(request, 'chat.html', {'messages': messages})    
