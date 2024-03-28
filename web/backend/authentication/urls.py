from django.contrib import admin
from django.urls import path, include

from .views import register_view, login_view

urlpatterns = [
    path("register/", register_view, name="register-user"),
    path("login/", login_view, name="login-user"),
]
