from django.urls import path, re_path, include
from rest_framework import routers

from .views import ListUsers, ListCompanies, ListLocations, FastSearch, ResultTest

router = routers.DefaultRouter()
router.register(r'users', ListUsers)
router.register(r'companies', ListCompanies)
# router.register(r'search', ListCompanies, basename="search")
router.register(r'fsearch', FastSearch, basename="fsearch")
router.register(r"locations", ListLocations)
# router.register(r"results", ResultTest, basename=3)
# router.register(r"test", TestResult, basename=1)

urlpatterns = router.urls
for u in urlpatterns:
    print(u)
