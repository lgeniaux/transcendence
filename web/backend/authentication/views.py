from django.shortcuts import render
import os


def register_view(request):
    return render(request, "authentication/register.html")


def login_view(request):
    return render(request, "authentication/login.html")
