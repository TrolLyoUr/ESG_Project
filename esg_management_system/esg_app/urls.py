from django.urls import path, re_path, include
from rest_framework import routers

from .views import ListUsers

router = routers.DefaultRouter()
router.register(r'users', ListUsers)

urlpatterns = router.urls
