import rest_framework.mixins
from rest_framework import generics
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.db import connection

from .calculations import calculate_metric_score

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
    MetricsDataSerializer
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
            return Company.objects.filter(name__istartswith=pk).all()[:10]
        else:
            return Company.objects.all()[:50]

    def retrieve(self, request, pk=None, *args, **kwargs):
        queryset = self.get_queryset(pk=pk)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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


class SaveMetricPreference(generics.CreateAPIView):
    serializer_class = UserMetricPreferenceSerializer

    def post(self, request, *args, **kwargs):
        serializer = UserMetricPreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.create(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SaveIndicatorPreference(generics.CreateAPIView):
    serializer_class = UserIndicatorPreferenceSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = UserIndicatorPreferenceSerializer(data=data)
        if serializer.is_valid():
            serializer.create(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MetricsDataViewSet(viewsets.GenericViewSet, rest_framework.mixins.RetrieveModelMixin):
    def get_serializer_class(self):
        if self.action == "list":
            return MetricsDataSerializer
        elif self.action == "retrieve":
            return MetricsDataSerializer
        return super().get_serializer_class()

    # def get_queryset(self, data1=None, data2=None):
    #     data1 = Data1()

    def retrieve(self, request, *args, **kwargs):
        company_ids = request.query_params.getlist("companies")
        framework_id = request.query_params.get("framework")
        metric_ids = request.query_params.getlist("metrics")

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


class ListIndicatorValue(generics.ListAPIView):

    def get(self, request, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute(
                f'select esg_app_metricindicator.metric_id, esg_app_metricindicator.indicator_id, esg_app_metric.name, esg_app_indicator.name, esg_app_metric.description, esg_app_indicator.description, value, unit, year from esg_app_datavalue join esg_app_indicator on esg_app_datavalue.indicator_id=esg_app_indicator.id join esg_app_metricindicator on esg_app_indicator.id=esg_app_metricindicator.indicator_id join esg_app_metric on esg_app_metric.id=esg_app_metricindicator.metric_id where company_id={request.query_params.get("company")};')
            row = cursor.fetchall()
        row = [
            {"metric_id": r[0], "indicator_id": r[1], "metric_name": r[2], "indicator_name": r[3], "metric_desc": r[4],
             "indicator_desc": r[5], "value": r[6], "unit": r[7], "year": r[8]} for r in row]
        return Response({'data': row})


class ListUserPreference(viewsets.ReadOnlyModelViewSet):
    queryset = []

    @action(detail=True, methods=['get'])
    def listindicators(self, request, pk=None):
        queryset = UserIndicatorPreference.objects.all()
        serializer = UserIndicatorPreferenceSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def listmetrics(self, request, pk=None):
        queryset = UserMetricPreference.objects.all()
        serializer = UserMetricPreferenceSerializer(queryset, many=True)
        return Response(serializer.data)
