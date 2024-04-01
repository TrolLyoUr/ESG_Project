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
