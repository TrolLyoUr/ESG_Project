from django.db.models import Sum, F, FloatField, Q
from django.db.models.functions import Coalesce
from .models import MetricIndicator


def calculate_metric_score(company, framework, metric):
    metric_indicators = MetricIndicator.objects.filter(metric=metric)
    indicator_values = {}

    for metric_indicator in metric_indicators:
        indicator = metric_indicator.indicator
        predefined_weight = metric_indicator.predefined_weight

        data_value = (
            DataValue.objects.filter(company=company, indicator=indicator)
            .filter(
                Q(
                    company__data_values__indicator__metric_indicators__metric__framework_metrics__framework=framework
                )
            )
            .order_by("-year")
            .first()
        )

        if data_value:
            value = data_value.value
            indicator_values[indicator.name] = value * predefined_weight

    metric_score = calculate_metric_formula(metric.name, indicator_values)
    return metric_score


class MetricFormulas:
    def greenhouse_gas_emissions_intensity(self, indicator_values):
        co2_direct_scope1 = indicator_values.get("CO2DIRECTSCOPE1", 0)
        co2_indirect_scope2 = indicator_values.get("CO2INDIRECTSCOPE2", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        if energy_use_total > 0:
            metric_score = (co2_direct_scope1 + co2_indirect_scope2) / energy_use_total
        else:
            metric_score = 0
        return metric_score

    def water_efficiency(self, indicator_values):
        water_withdrawal_total = indicator_values.get("WATERWITHDRAWALTOTAL", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        if energy_use_total > 0:
            metric_score = water_withdrawal_total / energy_use_total
        else:
            metric_score = 0
        return metric_score

    # 继续添加其他指标的计算公式...

    def default(self, indicator_values):
        return 0


metric_formulas = {
    "Greenhouse Gas (GHG) Emissions Intensity": MetricFormulas.greenhouse_gas_emissions_intensity,
    "Water Efficiency": MetricFormulas.water_efficiency,
    # 继续添加其他指标名称和对应的函数映射...
}


def calculate_metric_formula(metric_name, indicator_values):
    formula_func = metric_formulas.get(metric_name, MetricFormulas.default)
    metric_formulas_instance = MetricFormulas()
    metric_score = formula_func(metric_formulas_instance, indicator_values)
    return metric_score
