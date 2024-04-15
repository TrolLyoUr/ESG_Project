from django.urls import path, re_path, include
from rest_framework import routers

from .views import (
    FastSearch,
    FrameworkViewSet,
    SaveMetricPreference,
    SaveIndicatorPreference,
    MetricsDataViewSet,
    ListIndicatorValue,
    ListUserPreference,
    GetUserID
)

router = routers.SimpleRouter()
# search company by name and case insensitive
# http://127.0.0.1:8000/app/fsearch/Tran/
router.register(r"fsearch", FastSearch, basename="fsearch")
# return framework and metrics
# 1. http://127.0.0.1:8000/app/frameworks/ return frameworks
# 2. http://127.0.0.1:8000/app/frameworks/4/metrics/ return metrics and indicators
router.register(r"frameworks", FrameworkViewSet)
# calculate performance based on provided company, framework and metric id
# http://127.0.0.1:8000/app/metricsdatavalue/?companies=1&framework=4&metrics=62
router.register(r"metricsdatavalue", MetricsDataViewSet, basename="calculation")
# return user personal setting
# http://127.0.0.1:8000/app/listpreference/1/listindicators/
# http://127.0.0.1:8000/app/listpreference/1/listmetrics/
router.register(r"listpreference", ListUserPreference, basename="listpreference")

urlpatterns = [re_path(r"metricsdatavalue", MetricsDataViewSet.as_view({'get': 'retrieve'})),
               # http://127.0.0.1:8000/app/metricsdatavalue/?companies=1&framework=4&metrics=62
               re_path(r"savemetrics", SaveMetricPreference.as_view(), name='savemetrics'),
               # just support post method, example can find below
               re_path(r"saveindicator", SaveIndicatorPreference.as_view(), name='saveindicator'),
               # just support post method, similar as before
               re_path(r"indicatordata", ListIndicatorValue.as_view(), name='listindicatorvalue'),
               # http://127.0.0.1:8000/app/indicatordata?company=1
               re_path(r"currentuser", GetUserID.as_view(), name='currentuser')
               # return current user ID
               # http://127.0.0.1:8000/app/currentuser
               ]
urlpatterns += router.urls
'''
example for post test through curl
curl -X POST --location "http://127.0.0.1:8000/app/saveindicator/" \
-H "Accept: */*" \
   -H "Content-Type: application/json" \
   -d "{
\"user\": 1,
\"indicator\": 8,
\"metric\": 58,
\"custom_weight\": 0.5
}"
'''
for u in urlpatterns:
    print(u)
