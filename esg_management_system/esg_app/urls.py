from django.urls import path, re_path, include
from rest_framework import routers

from .views import ListUsers, ListCompanies, ListLocations, TestResult

router = routers.DefaultRouter()
router.register(r'users', ListUsers)
router.register(r'companies', ListCompanies)
router.register(r'search', ListCompanies, basename=1)
router.register(r"locations", ListLocations)
# router.register(r"test", TestResult, basename=1)

urlpatterns = router.urls
# print(urlpatterns)
