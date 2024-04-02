from rest_framework import generics
from rest_framework import permissions, viewsets
from django.contrib.auth import get_user_model
from rest_framework.response import Response
# 引入所有的model
from esg_app.models import Company, Framework, Indicator, Location, Metric, DataValue, FrameworkMetric, MetricIndicator, \
    UserMetricPreference, UserIndicatorPreference
from .serializers import UserSerializer, CompanySerializer, FrameworkSerializer, DataValueSerializer, \
    IndicatorSerializer, LocationSerializer, MetricSerializer, FrameworkMetricSerializer, MetricIndicatorSerializer, \
    UserMetricPreferenceSerializer, UserIndicatorPreferenceSerializer, TestSerializer
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated


class TestResult:
    def __init__(self, result):
        self.result = str(result)


class Test(viewsets.ViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = TestResult(966543)
    serializer_class = TestSerializer


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
    queryset = Company.objects.all()[:10]
    serializer_class = CompanySerializer

    def retrieve(self, request, pk=None, *args, **kwargs):
        queryset = Company.objects.filter(location_id=pk).all()
        return Response(self.serializer_class(queryset, many=True, context={'request': request}).data)


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
