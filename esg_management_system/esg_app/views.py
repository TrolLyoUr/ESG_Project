from rest_framework import permissions, viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer


class ListUsers(viewsets.ModelViewSet):
    authentication_classes = [permissions.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer
