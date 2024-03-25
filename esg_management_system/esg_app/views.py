from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response


# @login_required(login_url='usermanage/login')
# @api_view(['GET'])
# def index(request):
#     return Response({'message': 'Thank you, world!'})
