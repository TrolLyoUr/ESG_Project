from django.urls import path, re_path, include
from rest_framework import routers

from .views import (
    ListLocations,
    FastSearch,
    FrameworkViewSet,
    ESGPerformanceViewSet,
    SaveMetricPreference
)

router = routers.DefaultRouter()
# router.register(r'search', ListCompanies, basename="search")
router.register(r"fsearch", FastSearch, basename="fsearch")
router.register(r"locations", ListLocations)
router.register(r"frameworks", FrameworkViewSet)
router.register(r"savemetrics", SaveMetricPreference, basename="savemetrics")
router.register(r"esg-performance", ESGPerformanceViewSet, basename="esg-performance")

urlpatterns = router.urls
for u in urlpatterns:
    print(u)
