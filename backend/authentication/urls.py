from django.contrib import admin
from django.urls import path, include

from .views import register_view, login_view

urlpatterns = [
    path('register.html', register_view, name='register-user'),
    path('login.html', login_view, name='login-user'),
]
