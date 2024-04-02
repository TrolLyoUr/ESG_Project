from django.urls import path, re_path, include
from rest_framework import routers

from .views import ListUsers, ListCompanies, ListLocations, FastSearch, FrameworkViewSet, ResultTest

router = routers.DefaultRouter()
router.register(r'users', ListUsers)
router.register(r'companies', ListCompanies)
# router.register(r'search', ListCompanies, basename="search")
router.register(r'fsearch', FastSearch, basename="fsearch")
router.register(r"locations", ListLocations)
router.register(r"test", ResultTest, basename="tresult")

urlpatterns = router.urls
for u in urlpatterns:
    print(u)
