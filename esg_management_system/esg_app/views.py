import rest_framework.mixins
from rest_framework import generics
from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.db import connection
from rest_framework.views import APIView
from collections import defaultdict
from django.http import JsonResponse
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
        user = request.user.id
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
                    score = calculate_metric_score_by_year(company, framework, metric, year, user)
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
                        score = calculate_metric_score_by_year(company, framework, metric, year['year'], user)
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


class ListIndicatorValue(APIView):

    def get(self, request, *args, **kwargs):
        data = defaultdict(dict)
        with connection.cursor() as cursor:
            year = request.query_params.get("year")
            framework = request.query_params.get("framework")
            company = request.query_params.get("company")
            base_query = f'''
                SELECT m.id AS metric_id, i.id AS indicator_id, m.name AS metric_name, i.name AS indicator_name, dv.value, 
                       i.unit, dv.year, i.source, m.pillar, fm.predefined_weight AS metric_weight, 
                       mi.predefined_weight AS indicator_weight
                FROM esg_app_datavalue dv
                JOIN esg_app_indicator i ON dv.indicator_id = i.id
                JOIN esg_app_metricindicator mi ON i.id = mi.indicator_id
                JOIN esg_app_metric m ON mi.metric_id = m.id
                JOIN esg_app_frameworkmetric fm ON m.id = fm.metric_id
                WHERE dv.company_id = {company}
            '''

            if year and framework:
                cursor.execute(f"{base_query} AND dv.year = {year} AND fm.framework_id = {framework};")
            elif year:
                cursor.execute(f"{base_query} AND dv.year = {year};")
            elif framework:
                cursor.execute(f"{base_query} AND fm.framework_id = {framework};")
            else:
                cursor.execute(base_query)

            rows = cursor.fetchall()
        
        for r in rows:
            metric_id = r[0]
            if metric_id not in data:
                data[metric_id] = {
                    'metric_id': metric_id,
                    'metric_name': r[2],
                    'pillar': r[8],
                    'predefined_weight': r[9],  # Weight of the metric within the framework
                    'indicators': []
                }
            indicator_data = {
                "indicator_id": r[1],
                "indicator_name": r[3],
                "value": r[4],
                "unit": r[5],
                "year": r[6],
                "source": r[7],
                "predefined_weight": r[10]  # Weight of the indicator within the metric
            }
            if indicator_data not in data[metric_id]['indicators']:
                data[metric_id]['indicators'].append(indicator_data)

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
   # Query to fetch weighted values of indicators for each metric in the frameworks, grouped by year
        company_id = request.query_params.get('company')
        scores_query = """
        SELECT dv.year, f.name as framework_name, fm.predefined_weight as framework_weight, 
            m.name as metric_name, 
            i.name as indicator_name, dv.value * mi.predefined_weight as weighted_value
        FROM esg_app_datavalue dv
        JOIN esg_app_indicator i ON dv.indicator_id = i.id
        JOIN esg_app_metricindicator mi ON i.id = mi.indicator_id
        JOIN esg_app_metric m ON mi.metric_id = m.id
        JOIN esg_app_frameworkmetric fm ON m.id = fm.metric_id
        JOIN esg_app_framework f ON fm.framework_id = f.id
        WHERE dv.company_id = %s
        ORDER BY dv.year, fm.framework_id, m.id;
        """

        with connection.cursor() as cursor:
            cursor.execute(scores_query, [company_id])
            rows = cursor.fetchall()

        # Structure to hold the calculated scores
        company_scores = {}

        # Temporary storage for current processing
        year_data = {}
        metrics_data = {}

        for row in rows:
            year, framework_name, framework_weight, metric_name, indicator_name, weighted_value = row
            
            if framework_name not in company_scores:
                company_scores[framework_name] = {}
            
            if year not in company_scores[framework_name]:
                company_scores[framework_name][year] = {'total_score': 0, 'metrics': {}}
            
            if metric_name not in metrics_data:
                metrics_data[metric_name] = {}

            metrics_data[metric_name][indicator_name] = weighted_value

            # Apply formulas and aggregate scores within each year and framework
            if year != year_data.get('year') or framework_name != year_data.get('framework_name'):
                if year_data:
                    aggregate_scores(year_data, metrics_data, company_scores)
                year_data = {'year': year, 'framework_name': framework_name, 'framework_weight': framework_weight}
                metrics_data = {}

        # Ensure the last set of data is processed
        if year_data:
            aggregate_scores(year_data, metrics_data, company_scores)

        print("final:", company_scores)
        return JsonResponse(company_scores)

def aggregate_scores(year_data, metrics_data, company_scores):
        print("year_data", year_data)
        print("metrics_data", metrics_data)
        print("company_scores", company_scores)
        
        year = year_data['year']
        framework_name = year_data['framework_name']
        framework_weight = year_data['framework_weight']

        for metric_name, indicators in metrics_data.items():
            print(f"Processing metric {metric_name}")
            print(f"Indicators: {indicators}")
            score = apply_metric_formula(framework_name, metric_name, indicators)
            print(f"Metric: {metric_name}, Score: {score}")
            if score == -1:
                continue
            weighted_score = score * framework_weight
            company_scores[framework_name][year]['metrics'][metric_name] = score
            company_scores[framework_name][year]['total_score'] += weighted_score

def apply_metric_formula(framework, metric_name, indicators):
    framework = framework.upper()

    indicator_requirements = {
    'GRI': {
        "Greenhouse Gas (GHG) Emissions Intensity": ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'CO2INDIRECTSCOPE3', 'ENERGYUSETOTAL'],
        "Water Efficiency": ['WATERWITHDRAWALTOTAL', 'ENERGYUSETOTAL'],
        "Renewable Energy Utilization": ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
        "Waste Recycling Rate": ['WASTE_RECYCLED', 'WASTETOTAL'],
        "Carbon Intensity": ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL'],
        "Air Quality Impact": ['SOXEMISSIONS', 'NOXEMISSIONS', 'PARTICULATE_MATTER_EMISSIONS'],
        "Gender Pay Equity": ['GENDER_PAY_GAP_PERCENTAGE'],
        "Diversity in Leadership": ['WOMENMANAGERS', 'ANALYTICBOARDFEMALE'],
        "Employee Turnover Rate": ['TURNOVEREMPLOYEES'],
        "Workforce Training Investment": ['AVGTRAININGHOURS'],
        "Labor Relations Quality": ['TRADEUNIONREP'],
        "Health and Safety Performance": ['TIRTOTAL', 'LOSTWORKINGDAYS', 'EMPLOYEEFATALITIES'],
        "Employee Well-being and Engagement": ['COMMMEETINGSATTENDANCEAVG'],
        "Workforce Diversity": ['WOMENEMPLOYEES'],
        "Board Composition and Diversity": ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE'],
        "Board Meeting Engagement": ['BOARDMEETINGATTENDANCEAVG'],
        "Executive Compensation Alignment": ['CEO_PAY_RATIO_MEDIAN'],
        "Committee Independence": ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND'],
        "Governance Structure Effectiveness": ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD'],
        "Transparency and Accountability": ['ANALYTICNONAUDITAUDITFEESRATIO']
    },
    'SASB': {
        "Greenhouse Gas (GHG) Emissions Intensity": ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL'],
        "Water Efficiency": ['WATERWITHDRAWALTOTAL', 'ELECTRICITYPURCHASED'],
        "Renewable Energy Utilization": ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
        "Waste Recycling Rate": ['ANALYTICWASTERECYCLINGRATIO'],
        "Carbon Intensity": ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ANNUAL_MEDIAN_COMPENSATION'],
        "Air Quality Impact": ['SOXEMISSIONS', 'NOXEMISSIONS', 'PARTICULATE_MATTER_EMISSIONS'],
        "Gender Pay Equity": ['GENDER_PAY_GAP_PERCENTAGE'],
        "Diversity in Leadership": ['WOMENMANAGERS', 'ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE'],
        "Employee Turnover Rate": ['TURNOVEREMPLOYEES'],
        "Workforce Training Investment": ['AVGTRAININGHOURS'],
        "Labor Relations Quality": ['TRADEUNIONREP'],
        "Health and Safety Performance": ['TIRTOTAL', 'LOSTWORKINGDAYS'],
        "Employee Well-being and Engagement": ['BOARDMEETINGATTENDANCEAVG'],
        "Workforce Diversity": ['WOMENEMPLOYEES', 'ANALYTICBOARDFEMALE'],
        "Board Composition and Diversity": ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE', 'ANALYTICNONEXECBOARD'],
        "Board Meeting Engagement": ['BOARDMEETINGATTENDANCEAVG', 'COMMMEETINGSATTENDANCEAVG'],
        "Executive Compensation Alignment": ['CEO_PAY_RATIO_MEDIAN', 'ANALYTICNONAUDITAUDITFEESRATIO'],
        "Committee Independence": ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND', 'ANALYTICNOMINATIONCOMMIND'],
        "Governance Structure Effectiveness": ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD', 'BOARDMEETINGATTENDANCEAVG'],
        "Transparency and Accountability": ['ANALYTICNONAUDITAUDITFEESRATIO', 'AUDITCOMMNONEXECMEMBERS', 'COMPCOMMNONEXECMEMBERS']
    },
    'TCFD': {
        "Greenhouse Gas (GHG) Emissions Intensity": ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL', 'TRANALYTICRENEWENERGYUSE'],
        "Water Efficiency": ['WATERWITHDRAWALTOTAL', 'ENERGYUSETOTAL'],
        "Renewable Energy Utilization": ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
        "Waste Recycling Rate": ['WASTE_RECYCLED', 'WASTETOTAL'],
        "Carbon Intensity": ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL', 'CO2_NO_EQUIVALENTS'],
        "Air Quality Impact": ['SOXEMISSIONS', 'NOXEMISSIONS', 'PARTICULATE_MATTER_EMISSIONS'],
        "Gender Pay Equity": ['GENDER_PAY_GAP_PERCENTAGE'],
        "Diversity in Leadership": ['WOMENMANAGERS', 'ANALYTICBOARDFEMALE'],
        "Employee Turnover Rate": ['TURNOVEREMPLOYEES'],
        "Workforce Training Investment": ['AVGTRAININGHOURS'],
        "Labor Relations Quality": ['TRADEUNIONREP'],
        "Health and Safety Performance": ['TIRTOTAL', 'LOSTWORKINGDAYS', 'EMPLOYEEFATALITIES'],
        "Employee Well-being and Engagement": ['COMMMEETINGSATTENDANCEAVG', 'BOARDMEETINGATTENDANCEAVG'],
        "Workforce Diversity": ['WOMENEMPLOYEES', 'ANALYTICBOARDFEMALE'],
        "Board Composition and Diversity": ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE', 'ANALYTICNONEXECBOARD'],
        "Board Meeting Engagement": ['BOARDMEETINGATTENDANCEAVG'],
        "Executive Compensation Alignment": ['CEO_PAY_RATIO_MEDIAN'],
        "Committee Independence": ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND', 'ANALYTICNOMINATIONCOMMIND'],
        "Governance Structure Effectiveness": ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD'],
        "Transparency and Accountability": ['ANALYTICNONAUDITAUDITFEESRATIO']
    }
}

    # Check for missing indicators
    required_indicators = indicator_requirements.get(framework, {}).get(metric_name, [])
    if any(ind not in indicators for ind in required_indicators):
        return -1

    # Define formulas for each metric
    if metric_name == "Greenhouse Gas (GHG) Emissions Intensity":
        # Implementation for different frameworks
        if framework == 'GRI':
            result = sum(indicators.get(ind, 0) for ind in ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'CO2INDIRECTSCOPE3']) / indicators.get('ENERGYUSETOTAL', 1)
        elif framework == 'SASB':
            result = sum(indicators.get(ind, 0) for ind in ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2']) / indicators.get('ENERGYUSETOTAL', 1)
        elif framework == 'TCFD':
            energy_adjusted = indicators.get('TRANALYTICRENEWENERGYUSE',0) * (1 + indicators.get('TRANALYTICRENEWENERGYUSE', 0) / 100)
            if energy_adjusted == 0:
                return 0
            result = sum(indicators.get(ind, 0) for ind in ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2']) / energy_adjusted
        return result if indicators.get('ENERGYUSETOTAL', 0) > 0 else 0

    elif metric_name == "Water Efficiency":
        if framework == 'GRI':
            return indicators.get('WATERWITHDRAWALTOTAL', 0) / indicators.get('ENERGYUSETOTAL', 1)
        elif framework == 'SASB':
            return indicators.get('WATERWITHDRAWALTOTAL', 0) / indicators.get('ELECTRICITYPURCHASED', 1)

    elif metric_name == "Renewable Energy Utilization":
        return (indicators.get('RENEWENERGYCONSUMED', 0) / indicators.get('ENERGYUSETOTAL', 1)) if indicators.get('ENERGYUSETOTAL', 0) > 0 else 0

    elif metric_name == "Waste Recycling Rate":
        if framework == 'GRI':
            return (indicators.get('WASTE_RECYCLED', 0) / indicators.get('WASTETOTAL', 1)) if indicators.get('WASTETOTAL', 0) > 0 else 0
        elif framework == 'SASB':
            return indicators.get('ANALYTICWASTERECYCLINGRATIO', 0)

    elif metric_name == "Carbon Intensity":
        if framework in ['GRI', 'TCFD']:
            return (sum(indicators.get(ind, 0) for ind in ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2']) / indicators.get('ENERGYUSETOTAL', 1)) if indicators.get('ENERGYUSETOTAL', 0) > 0 else 0
        elif framework == 'SASB':
            return (sum(indicators.get(ind, 0) for ind in ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2']) / indicators.get('ANNUAL_MEDIAN_COMPENSATION', 1)) if indicators.get('ANNUAL_MEDIAN_COMPENSATION', 0) > 0 else 0

    elif metric_name == "Gender Pay Equity":
        if framework == 'GRI':
            return indicators.get('GENDER_PAY_GAP_PERCENTAGE', 0)
        elif framework == 'SASB':
            return indicators.get('GENDER_PAY_GAP_PERCENTAGE', 0) # Assuming same formula for simplicity

    elif metric_name == "Diversity in Leadership":
        if framework == 'GRI':
            return sum(indicators.get(ind, 0) for ind in ['WOMENMANAGERS', 'ANALYTICBOARDFEMALE']) / 2
        elif framework == 'SASB':
            return sum(indicators.get(ind, 0) for ind in ['WOMENMANAGERS', 'ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE']) / 3

    elif metric_name == "Employee Turnover Rate":
        # Assuming same formula for both frameworks
        return indicators.get('TURNOVEREMPLOYEES', 0)

    elif metric_name == "Workforce Training Investment":
        # Assuming same formula for both frameworks
        return indicators.get('AVGTRAININGHOURS', 0)

    elif metric_name == "Labor Relations Quality":
        # Assuming same formula for both frameworks
        return indicators.get('TRADEUNIONREP', 0)

    elif metric_name == "Health and Safety Performance":
        if framework == 'GRI':
            tir_total = indicators.get('TIRTOTAL', 0)
            lost_days = indicators.get('LOSTWORKINGDAYS', 0) / 1000
            fatalities = indicators.get('EMPLOYEEFATALITIES', 0)
            return (tir_total + lost_days + fatalities) / 3
        elif framework == 'SASB':
            return (indicators.get('TIRTOTAL', 0) + indicators.get('LOSTWORKINGDAYS', 0) / 1000) / 2
    elif metric_name == "Employee Well-being and Engagement":
        if framework == 'GRI':
            return indicators.get('COMMMEETINGSATTENDANCEAVG', 0)
        elif framework == 'SASB':
            return indicators.get('BOARDMEETINGATTENDANCEAVG', 0)

    elif metric_name == "Workforce Diversity":
        if framework == 'GRI':
            return indicators.get('WOMENEMPLOYEES', 0)
        elif framework == 'SASB':
            return (indicators.get('WOMENEMPLOYEES', 0) + indicators.get('ANALYTICBOARDFEMALE', 0)) / 2

    elif metric_name == "Board Composition and Diversity":
        components = ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE']
        if framework == 'SASB':
            components.append('ANALYTICNONEXECBOARD')
        return sum(indicators.get(component, 0) for component in components) / len(components)

    elif metric_name == "Board Meeting Engagement":
        if framework == 'GRI':
            return indicators.get('BOARDMEETINGATTENDANCEAVG', 0)
        elif framework == 'SASB':
            return (indicators.get('BOARDMEETINGATTENDANCEAVG', 0) + indicators.get('COMMMEETINGSATTENDANCEAVG', 0)) / 2

    elif metric_name == "Executive Compensation Alignment":
        if framework == 'GRI':
            return indicators.get('CEO_PAY_RATIO_MEDIAN', 0)
        elif framework == 'SASB':
            ceo_ratio = indicators.get('CEO_PAY_RATIO_MEDIAN', 0)
            non_audit_ratio = indicators.get('ANALYTICNONAUDITAUDITFEESRATIO', 0)
            return (ceo_ratio + (1 - non_audit_ratio)) / 2

    elif metric_name == "Committee Independence":
        components = ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND']
        if framework == 'SASB':
            components.append('ANALYTICNOMINATIONCOMMIND')
        return sum(indicators.get(component, 0) for component in components) / len(components)

    elif metric_name == "Governance Structure Effectiveness":
        components = ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD']
        if framework == 'SASB':
            components.append(indicators.get('BOARDMEETINGATTENDANCEAVG', 0) / 100)
        return sum(indicators.get(component, 0) for component in components) / len(components)

    elif metric_name == "Transparency and Accountability":
        if framework == 'GRI':
            return 1 - indicators.get('ANALYTICNONAUDITAUDITFEESRATIO', 0)
        elif framework == 'SASB':
            non_audit_ratio = 1 - indicators.get('ANALYTICNONAUDITAUDITFEESRATIO', 0)
            audit_members = indicators.get('AUDITCOMMNONEXECMEMBERS', 0)
            comp_members = indicators.get('COMPCOMMNONEXECMEMBERS', 0)
            return (non_audit_ratio + audit_members + comp_members) / 3
    return -1

# Old implementation
# class CompanyPerformance(generics.ListAPIView):
#     def get(self, request, *args, **kwargs):
#         com_id = request.query_params.get("company")
#         scale = request.query_params.get('scale')
#         if com_id is None:
#             result = calculate_all_framework_scores_all_years(1)
#             return Response(result)
#         with open("result.pkl", "rb") as file:
#             data = pickle.load(file)
#         if scale is None:
#             result = data[int(com_id)]
#             return Response(result)
#         else:
#             _result = data[int(com_id)]
#             _new_result = {}
#             for key, value in _result.items():
#                 __new_result = {}
#                 for k, v in value.items():
#                     try:
#                         # tanh = lambda x: ((numpy.e ** x) - (numpy.e ** -x)) / ((numpy.e ** x) + (numpy.e ** -x))
#                         tanh = lambda x: 1 - (1 / (1 + x))
#                         __new_result[k] = tanh(v) * 100
#                     except OverflowError:
#                         __new_result[k] = 100
#                 _new_result[key] = __new_result
#             return Response(_new_result)