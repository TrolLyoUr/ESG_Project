from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.contrib import messages
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            request.session.setdefault('username', username)
            login(request, user)
            return HttpResponseRedirect(reverse("esg_app:index"))
        else:
            messages.error(request, "username or password is incorrect")
            logout(request)
            return render(request, 'login.html')
    else:
        return render(request, 'login.html')


def register_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST['email']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            messages.error(request, "username already exists")
            return render(request, 'register.html')
        try:
            validate_email(email)
            user = User.objects.create_user(username, email, password)
            user.save()
            return HttpResponseRedirect(reverse("esg_app:index"))
        except ValidationError as _:
            messages.error(request, "invalid email address!")
            return render(request, 'register.html')

    else:
        return render(request, 'register.html')


def resetpwd_send_view(request):
    pass


def resetpwd_view(request):
    pass
