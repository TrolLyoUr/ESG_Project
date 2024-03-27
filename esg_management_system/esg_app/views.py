from rest_framework import permissions, viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated


class ListUsers(viewsets.ModelViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
