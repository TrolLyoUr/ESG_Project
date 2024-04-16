import rest_framework.mixins
from rest_framework import generics
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.db import connection
from rest_framework.views import APIView
from collections import defaultdict
import pickle
import numpy

from .calculations import calculate_metric_score_by_year, calculate_all_framework_scores_all_years

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
    FrameworkListSerializer,
    IndicatorInfoSerializer,
    MetricInfoSerializer,
    UserIndicatorPreferenceItemSerializer,
    UserMetricPreferenceItemSerializer,
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
    MetricsDataSerializer,
    YearSerializer
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


class YearViewSet(viewsets.ViewSet):
    def list(self, request):
        # Querying distinct years from DataValue model
        distinct_years = DataValue.objects.order_by('year').values('year').distinct()
        serializer = YearSerializer(distinct_years, many=True)
        return Response(serializer.data)


class FrameworkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Framework.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return FrameworkSerializer
        elif self.action == "list_framework_metrics":
            # Use the FrameworkMetricSerializer when listing framework metrics
            return FrameworkMetricSerializer
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="metrics")
    def list_framework_metrics(self, request, pk=None):
        framework = self.get_object()
        queryset = FrameworkMetric.objects.filter(framework=framework).select_related()

        pillar = request.query_params.get("pillar")
        if pillar in ["E", "S", "G"]:
            queryset = queryset.filter(metric__pillar=pillar)

        # Notice the change here: using FrameworkMetricSerializer directly
        serializer = FrameworkMetricSerializer(
            queryset, many=True, context={"request": request}
        )
        data = serializer.data
        return Response(data)


class SaveMetricPreferences(APIView):
    def post(self, request, *args, **kwargs):
        user_id = request.user.id
        data = [
            {**item, "user": user_id} for item in request.data
        ]
        print(data)
        serializer = UserMetricPreferenceItemSerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SaveIndicatorPreferences(APIView):
    def post(self, request, *args, **kwargs):
        user_id = request.user.id
        data = [
            {**item, "user": user_id} for item in request.data
        ]
        serializer = UserIndicatorPreferenceItemSerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
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
        year = request.query_params.get("year")
        years = DataValue.objects.order_by('year').values('year').distinct()

        # 查询指定的公司、框架和指标
        companies = Company.objects.filter(id__in=company_ids)
        framework = Framework.objects.get(id=framework_id)
        metrics = Metric.objects.filter(id__in=metric_ids)

        # 计算每个公司的每个指标的分数
        result = []
        for company in companies:
            company_data = CompanySerializer(company).data
            metrics_scores = []
            if year:
                for metric in metrics:
                    score = calculate_metric_score_by_year(company, framework, metric, year)
                    metric_data = MetricSerializer(metric).data
                    metrics_scores.append(
                        {
                            "year": year,
                            "metric_id": metric_data["id"],
                            "metric_name": metric_data["name"],
                            "score": score,
                        }
                    )
            else:
                for year in years:
                    for metric in metrics:
                        score = calculate_metric_score_by_year(company, framework, metric, year['year'])
                        metric_data = MetricSerializer(metric).data
                        metrics_scores.append(
                            {
                                "year": year['year'],
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
        data = defaultdict(dict)
        with connection.cursor() as cursor:
            year = request.query_params.get("year")
            framework = request.query_params.get("framework")
            if year is not None or framework is not None:
                if year is not None and framework is not None:
                    cursor.execute(
                        f'select esg_app_metricindicator.metric_id, esg_app_metricindicator.indicator_id, esg_app_metric.name, esg_app_indicator.name, value, unit, year, source, pillar from esg_app_datavalue join esg_app_indicator on esg_app_datavalue.indicator_id=esg_app_indicator.id join esg_app_metricindicator on esg_app_indicator.id=esg_app_metricindicator.indicator_id join esg_app_metric on esg_app_metric.id=esg_app_metricindicator.metric_id join esg_app_frameworkmetric on esg_app_frameworkmetric.metric_id=esg_app_metric.id where company_id={request.query_params.get("company")} and framework_id={framework} and year={year};')
                elif year is not None:
                    cursor.execute(
                        f'select esg_app_metricindicator.metric_id, esg_app_metricindicator.indicator_id, esg_app_metric.name, esg_app_indicator.name, value, unit, year, source, pillar from esg_app_datavalue join esg_app_indicator on esg_app_datavalue.indicator_id=esg_app_indicator.id join esg_app_metricindicator on esg_app_indicator.id=esg_app_metricindicator.indicator_id join esg_app_metric on esg_app_metric.id=esg_app_metricindicator.metric_id where company_id={request.query_params.get("company")} and year={year};')
                elif framework is not None:
                    cursor.execute(
                        f'select esg_app_metricindicator.metric_id, esg_app_metricindicator.indicator_id, esg_app_metric.name, esg_app_indicator.name, value, unit, year, source, pillar from esg_app_datavalue join esg_app_indicator on esg_app_datavalue.indicator_id=esg_app_indicator.id join esg_app_metricindicator on esg_app_indicator.id=esg_app_metricindicator.indicator_id join esg_app_metric on esg_app_metric.id=esg_app_metricindicator.metric_id join esg_app_frameworkmetric on esg_app_frameworkmetric.metric_id=esg_app_metric.id where company_id={request.query_params.get("company")} and framework_id={framework};')
            else:
                cursor.execute(
                    f'select esg_app_metricindicator.metric_id, esg_app_metricindicator.indicator_id, esg_app_metric.name, esg_app_indicator.name, value, unit, year, source, pillar from esg_app_datavalue join esg_app_indicator on esg_app_datavalue.indicator_id=esg_app_indicator.id join esg_app_metricindicator on esg_app_indicator.id=esg_app_metricindicator.indicator_id join esg_app_metric on esg_app_metric.id=esg_app_metricindicator.metric_id where company_id={request.query_params.get("company")};')
            row = cursor.fetchall()
        for r in row:
            if r[0] not in data.keys():
                data[r[0]] = {'metric_id': r[0], 'metric_name': r[2], 'pillar': r[8], 'indicators': []}
                data[r[0]]['indicators'].append(
                    {"indicator_id": r[1], "indicator_name": r[3], "value": r[4], "unit": r[5],
                     "year": r[6], "source": r[7]})
            else:
                same = False
                for i in data[r[0]]['indicators']:
                    if i["indicator_id"] == r[1] and i["year"] == r[6]:
                        same = True
                if not same:
                    data[r[0]]['indicators'].append(
                        {"indicator_id": r[1], "indicator_name": r[3], "value": r[4], "unit": r[5],
                         "year": r[6], "source": r[7]})
        return Response(data)


class ListUserPreference(viewsets.ReadOnlyModelViewSet):
    queryset = UserIndicatorPreference.objects.none()  # Default queryset doesn't fetch anything

    @action(detail=False, methods=['get'])
    def listindicators(self, request):
        user_id = request.user.id
        if not user_id:
            return Response({'error': 'logged in required'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = UserIndicatorPreference.objects.filter(user__id=user_id)
        serializer = UserIndicatorPreferenceItemSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def listmetrics(self, request):
        user_id = request.user.id
        if not user_id:
            return Response({'error': 'logged in required'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = UserMetricPreference.objects.filter(user__id=user_id)
        serializer = UserMetricPreferenceItemSerializer(queryset, many=True)
        return Response(serializer.data)


class IndicatorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Indicator.objects.all()
    serializer_class = IndicatorInfoSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned indicators to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Indicator.objects.all()
        indicator_id = self.request.query_params.get('id', None)
        if indicator_id is not None:
            queryset = queryset.filter(id=indicator_id)
        return queryset


class MetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Metric.objects.all()
    serializer_class = MetricInfoSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned metrics to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Metric.objects.all()
        metric_id = self.request.query_params.get('id', None)
        if metric_id is not None:
            queryset = queryset.filter(id=metric_id)
        return queryset


class CompanyPerformance(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        coms_id = request.query_params.getlist("company")
        tanh = request.query_params.get('tanh')
        with open("result.pkl", "rb") as file:
            data = pickle.load(file)
        if tanh is None:
            result = {}
            for c in coms_id:
                result[c] = data[int(c)]
            return Response(result)
        else:
            new_result = {}
            for c in coms_id:
                _result = data[int(c)]
                _new_result = {}
                for key, value in _result.items():
                    __new_result = {}
                    for k, v in value.items():
                        try:
                            tanh = lambda x: ((numpy.e ** x) - (numpy.e ** -x)) / ((numpy.e ** x) + (numpy.e ** -x))
                            __new_result[k] = tanh(v) * 100
                        except OverflowError:
                            __new_result[k] = 100
                    _new_result[key] = __new_result
                new_result[c] = _new_result
            return Response(new_result)
