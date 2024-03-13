from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required


@login_required(login_url='usermanage/login')
def index(request):
    return HttpResponse(f"<h1>Hello user: {request.session.get('username')}</h1>")
