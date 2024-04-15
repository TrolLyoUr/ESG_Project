from django.urls import re_path
from rest_framework import routers

from .views import (
    FastSearch,
    FrameworkViewSet,
    IndicatorViewSet,
    MetricViewSet,
    SaveMetricPreferences,
    SaveIndicatorPreferences,
    MetricsDataViewSet,
    ListIndicatorValue,
    ListUserPreference,
    YearViewSet,
    CompanyPerformance
)

router = routers.SimpleRouter()
# search company by name and case insensitive
# http://127.0.0.1:8000/app/fsearch/Tran/
router.register(r"fsearch", FastSearch, basename="fsearch")
# return all years
# http://127.0.0.1:8000/app/years/
router.register(r'years', YearViewSet, basename='year')
# return framework and metrics
# 1. http://127.0.0.1:8000/app/frameworks/ return frameworks
# 2. http://127.0.0.1:8000/app/frameworks/4/metrics/ return metrics and indicators
router.register(r"frameworks", FrameworkViewSet)
# return information of indicators and metrics
# http://127.0.0.1:8000/app/indicators/?id=3
# http://127.0.0.1:8000/app/metrics/?id=97
router.register(r'indicators', IndicatorViewSet)
router.register(r'metrics', MetricViewSet)
# calculate performance based on provided company, framework and metric id. return whole year data(from 2012-2023)
# http://127.0.0.1:8000/app/metricsdatavalue/?companies=1&framework=4&metrics=97
router.register(r"metricsdatavalue", MetricsDataViewSet, basename="calculation")
# return user personal weight setting
# http://127.0.0.1:8000/app/listpreference/listindicators/?user_id=1
# http://127.0.0.1:8000/app/listpreference/listmetrics/?user_id=1
router.register(r"listpreference", ListUserPreference, basename="listpreference")

urlpatterns = [re_path(r"metricsdatavalue", MetricsDataViewSet.as_view({'get': 'retrieve'})),
               # calculate performance based on provided company, framework and metric id. return whole year data(from 2012-2023)
               # http://127.0.0.1:8000/app/metricsdatavalue/?companies=1&framework=4&metrics=97
               re_path(r"savemetrics", SaveMetricPreferences.as_view(), name='savemetrics'),
               # just support post method, example can find below
               re_path(r"saveindicator", SaveIndicatorPreferences.as_view(), name='saveindicator'),
               # just support post method, similar as before
               re_path(r"indicatordata", ListIndicatorValue.as_view(), name='listindicatorvalue'),
               # return detail value
               # http://127.0.0.1:8000/app/indicatordata?company=1
               # http://127.0.0.1:8000/app/indicatordata?company=1&year=2021
               # http://127.0.0.1:8000/app/indicatordata?company=1&year=2021&framework=4
               re_path(r"calculateperformance", CompanyPerformance.as_view(), name='calculateperformance')
               # calculate whole performance
               # http://127.0.0.1:8000/app/calculateperformance?company=1
               ]
urlpatterns += router.urls
'''
example for post test through curl
curl -X POST "http://localhost:8000/saveindicator/" \
     -H "Content-Type: application/json" \
     -d '[
           {
             "indicator": 8,
             "metric": 98,
             "custom_weight": 0.5
           },
           {
             "indicator": 9,
             "metric": 98,
             "custom_weight": 0.7
           }
         ]'
'''
for u in urlpatterns:
    print(u)
