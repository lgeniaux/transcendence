from django.shortcuts import render
import os

#index Single Page Application
def index(request):
    return render(request, 'index.html')
