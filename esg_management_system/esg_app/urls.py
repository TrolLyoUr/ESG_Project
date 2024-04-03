from django.urls import path, re_path, include
from rest_framework import routers

from .views import (
    ListLocations,
    FastSearch,
    FrameworkViewSet,
    SaveMetricPreference,
    MetricsDataViewSet
)

router = routers.DefaultRouter()
# router.register(r'search', ListCompanies, basename="search")
router.register(r"fsearch", FastSearch, basename="fsearch")
router.register(r"locations", ListLocations)
router.register(r"frameworks", FrameworkViewSet)
router.register(r"savemetrics", SaveMetricPreference, basename="savemetrics")
router.register(r"metricsdatavalue", MetricsDataViewSet, basename="test")

urlpatterns = [re_path(r"metricsdatavalue", MetricsDataViewSet.as_view({'get': 'retrieve'})), ]
urlpatterns += router.urls
for u in urlpatterns:
    print(u)
