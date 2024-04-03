from rest_framework import generics
from rest_framework import permissions, viewsets
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status

# from calculations import calculate_metric_score

# 引入所有的model
from esg_app.models import (
    Company,
    Framework,
    Indicator,
    Location,
    Metric,
    DataValue,
    FrameworkMetric,
    MetricIndicator,
    UserMetricPreference,
    UserIndicatorPreference,
)
from .serializers import (
    FastCompanies,
    FrameworkDetailSerializer,
    FrameworkListSerializer,
    UserSerializer,
    CompanySerializer,
    FrameworkSerializer,
    DataValueSerializer,
    IndicatorSerializer,
    LocationSerializer,
    MetricSerializer,
    FrameworkMetricSerializer,
    MetricIndicatorSerializer,
    UserMetricPreferenceSerializer,
    UserIndicatorPreferenceSerializer,
    FrameworkMetrics,
)
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import Coalesce
from django.db.models import Sum, F, FloatField


class FastSearch(viewsets.ReadOnlyModelViewSet):

    def get_serializer_class(self):
        if self.action == "list":
            return FastCompanies
        elif self.action == "retrieve":
            return FastCompanies
        return super().get_serializer_class()

    def get_queryset(self, pk=None):
        if pk is not None:
            return Company.objects.filter(name__startswith=pk).all()[:10]
        else:
            return Company.objects.all()[:10]

    def retrieve(self, request, pk=None, *args, **kwargs):
        queryset = self.get_queryset(pk=pk)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# 所有公司对应的序列化器


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
        if self.action == "list":
            return FrameworkSerializer
        elif self.action == "retrieve":
            return FrameworkDetailSerializer
        elif self.action == "list_framework_metrics":
            # Use the FrameworkMetricSerializer when listing framework metrics
            return FrameworkMetricSerializer
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"frameworks": serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = {
            "id": serializer.data.get("id"),
            "name": serializer.data.get("name"),
            "description": serializer.data.get("description"),
        }
        return Response(response_data)

    @action(detail=True, methods=["get"], url_path="metrics")
    def list_framework_metrics(self, request, pk=None):
        framework = self.get_object()
        queryset = FrameworkMetric.objects.filter(framework=framework)

        pillar = request.query_params.get("pillar")
        if pillar in ["E", "S", "G"]:
            queryset = queryset.filter(metric__pillar=pillar)

        # Notice the change here: using FrameworkMetricSerializer directly
        serializer = FrameworkMetricSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class MetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer

    @action(detail=True, methods=["get"], url_path="indicators")
    def list_metric_indicators(self, request, pk=None):
        metric = self.get_object()
        queryset = metric.metric_indicators.all()

        serializer = MetricIndicatorSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class SaveMetricPreference(viewsets.ViewSet):
    def post(self, request):
        serializer = UserMetricPreferenceSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            user_metric_preference = serializer.create(serializer.validated_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ESGPerformanceViewSet(viewsets.ViewSet):
    def list(self, request):
        # 获取请求体中的数据
        # GET请求的样例/esg-performance/?company_ids=company_id1&company_ids=company_id2&framework_id=framework_id&metric_ids=metric_id1&metric_ids=metric_id2&metric_ids=metric_id3
        data = request.data
        company_ids = request.query_params.getlist("companies", [])
        framework_id = request.query_params.get("framework")
        metric_ids = request.query_params.getlist("metrics", [])

        # 查询指定的公司、框架和指标
        companies = Company.objects.filter(id__in=company_ids)
        framework = Framework.objects.get(id=framework_id)
        metrics = Metric.objects.filter(id__in=metric_ids)

        # 计算每个公司的每个指标的分数
        result = []
        for company in companies:
            company_data = CompanySerializer(company).data
            metrics_scores = []
            for metric in metrics:
                score = calculate_metric_score(company, framework, metric)
                metric_data = MetricSerializer(metric).data
                metrics_scores.append(
                    {
                        "metric_id": metric_data["id"],
                        "metric_name": metric_data["name"],
                        "score": score,
                    }
                )
            result.append(
                {
                    "company_id": company_data["id"],
                    "company_name": company_data["name"],
                    "metrics_scores": metrics_scores,
                }
            )

        return Response({"data": result})
