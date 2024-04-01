from rest_framework import generics
from rest_framework import permissions, viewsets
from django.contrib.auth import get_user_model
# 引入所有的model
from esg_app.models import Company, Framework, Indicator, Location, Metric, DataValue, FrameworkMetric, MetricIndicator, \
    UserMetricPreference, UserIndicatorPreference
from .serializers import UserSerializer, CompanySerializer, FrameworkSerializer, DataValueSerializer, \
    IndicatorSerializer, LocationSerializer, MetricSerializer, FrameworkMetricSerializer, MetricIndicatorSerializer, \
    UserMetricPreferenceSerializer, UserIndicatorPreferenceSerializer
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated


class ListUsers(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class ListLocations(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


# 所有公司对应的序列化器
class ListCompanies(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
 

class ListFrameworks(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Framework.objects.all()
    serializer_class = FrameworkSerializer

class ListIndicators(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Indicator.objects.all()
    serializer_class = IndicatorSerializer

class ListLocations(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class ListMetrics(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer

class ListDataValues(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = DataValue.objects.all()
    serializer_class = DataValueSerializer

class ListFrameworkMetrics(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = FrameworkMetric.objects.all()
    serializer_class = Framework

class ListMetricIndicators(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = MetricIndicator.objects.all()
    serializer_class = MetricIndicatorSerializer

class ListUserMetricPreferences(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = UserMetricPreference.objects.all()
    serializer_class = UserMetricPreferenceSerializer

class ListUserIndicatorPreferences(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = UserIndicatorPreference.objects.all()
    serializer_class = UserIndicatorPreferenceSerializer

# Path: esg_management_system/esg_app/urls.py