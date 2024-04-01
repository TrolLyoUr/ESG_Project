from django.urls import path, re_path, include
from rest_framework import routers

from .views import ListUsers, ListCompanies

router = routers.DefaultRouter()
router.register(r'users', ListUsers)
router.register(r'companies', ListCompanies)

urlpatterns = router.urls
print(urlpatterns)
