from django.urls import path, re_path, include
from rest_framework import routers

from .views import ListUsers, ListCompanies, ListLocations

router = routers.DefaultRouter()
router.register(r'users', ListUsers)
router.register(r'companies', ListCompanies)
router.register(r"locations", ListLocations)

urlpatterns = router.urls
print(urlpatterns)
