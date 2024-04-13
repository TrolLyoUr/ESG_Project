from django.urls import path, re_path, include
from rest_framework import routers

from .views import (
    FastSearch,
    FrameworkViewSet,
    SaveMetricPreference,
    MetricsDataViewSet
)

router = routers.SimpleRouter()
# router.register(r'search', ListCompanies, basename="search")
router.register(r"fsearch", FastSearch, basename="fsearch")
router.register(r"frameworks", FrameworkViewSet)
router.register(r"metricsdatavalue", MetricsDataViewSet, basename="test")

urlpatterns = [re_path(r"metricsdatavalue", MetricsDataViewSet.as_view({'get': 'retrieve'})),
               re_path(r"savemetrics", SaveMetricPreference.as_view(), name='savemetrics')]
urlpatterns += router.urls
# for u in urlpatterns:
#     print(u)
