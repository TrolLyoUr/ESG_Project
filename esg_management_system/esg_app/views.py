import rest_framework.views
from rest_framework import generics
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from rest_framework.response import Response
# 引入所有的model
from esg_app.models import Company, Framework, Indicator, Location, Metric, DataValue, FrameworkMetric, MetricIndicator, \
    UserMetricPreference, UserIndicatorPreference
from .serializers import UserSerializer, CompanySerializer, FrameworkSerializer, FrameworkDetailSerializer, \
    DataValueSerializer, \
    IndicatorSerializer, LocationSerializer, MetricSerializer, FrameworkMetricSerializer, MetricIndicatorSerializer, \
    UserMetricPreferenceSerializer, UserIndicatorPreferenceSerializer, FastCompanies
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import Coalesce
from django.db.models import Sum, F, FloatField


def calculate_company_framework_values():
    # 首先获取所有的Company对象
    companies = Company.objects.all()
    # 创建一个空字典results来存储每个公司的value
    results = {}

    # 为每个公司创建一个字典来存储该公司的每个框架的值。
    for company in companies:
        framework_values = {}
        data_values = DataValue.objects.filter(company=company)

        # 对于每个Framework,我们获取与该框架相关的所有FrameworkMetric对象
        for framework in Framework.objects.all():
            framework_metrics = FrameworkMetric.objects.filter(framework=framework)
            metric_values = {}

            # 对于每个FrameworkMetric,我们获取相关的Metric和预定义的权重
            for fm in framework_metrics:
                metric = fm.metric
                weight = fm.predefined_weight

                # 使用Django的ORM和annotate函数来计算每个指标的加权值
                indicator_values = MetricIndicator.objects.filter(
                    metric=metric
                ).annotate(
                    weighted_value=Coalesce(
                        Sum(
                            F("indicator__data_values__value") * F("predefined_weight"),
                            output_field=FloatField(),
                        ),
                        0.0,
                    )
                )

                # 将每个指标的加权值相加,得到该框架下该的value,并将其存储在metric_values字典中
                metric_value = sum(iv.weighted_value for iv in indicator_values)
                metric_values[metric.name] = metric_value * weight

            # 最后,把framework_values字典存储在results字典里,键是公司名称
            framework_value = sum(metric_values.values())
            framework_values[framework.name] = framework_value

        results[company.name] = framework_values

    return results


class ResultTest(viewsets.GenericViewSet):
    def get(self):
        result = calculate_company_framework_values
        return Response(result)


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
