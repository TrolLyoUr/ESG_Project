from rest_framework import generics
from rest_framework import permissions, viewsets
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# 引入所有的model
from esg_app.models import Company, Framework, Indicator, Location, Metric, DataValue, FrameworkMetric, MetricIndicator, UserMetricPreference, UserIndicatorPreference
from .serializers import UserSerializer, CompanySerializer, FrameworkSerializer,DataValueSerializer, IndicatorSerializer, LocationSerializer, MetricSerializer, FrameworkMetricSerializer, MetricIndicatorSerializer, UserMetricPreferenceSerializer, UserIndicatorPreferenceSerializer, FrameworkMetrics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import Coalesce
from django.db.models import Sum, F, FloatField


class ResultTest(viewsets.GenericViewSet):
    def get(self):
        result = "hhhh"
        return Response(result)


class ListFrameworkMetrics(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = FrameworkMetric.objects.all()
    serializer_class = FrameworkMetrics

    def retrieve(self, request, pk=None, *args, **kwargs):
        print(pk)
        metrics = FrameworkMetric.objects.filter(framework_id=pk).all()
        serializer = FrameworkMetrics(metrics, many=True)
        return Response(serializer.data)


class FastSearch(viewsets.ViewSet):

    def retrieve(self, request, pk=None, *args, **kwargs):
        # print(calculate_company_framework_values())
        companies = Company.objects.filter(name__startswith=pk).all()[:10]
        serializer = FastCompanies(companies, many=True)
        return Response(serializer.data)


class ListUsers(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


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

class FrameworkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Framework.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return FrameworkSerializer
        if self.action == 'retrieve':
            return FrameworkDetailSerializer
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'frameworks': serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        # Reformat the response to match the exact desired output
        response_data = {
            "id": serializer.data.get("id"),
            "name": serializer.data.get("name"),
            "description": serializer.data.get("description")
        }
        return Response(response_data)

class SaveMetricPreference(APIView):
    def post(self, request):
        serializer = UserMetricPreferenceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user_metric_preference = serializer.create(serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)