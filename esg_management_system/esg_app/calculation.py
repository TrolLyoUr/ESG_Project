# calculations.py
from django.db.models import Sum, F, FloatField
from django.db.models.functions import Coalesce
from .models import (
    Company,
    Framework,
    DataValue,
    FrameworkMetric,
    MetricIndicator,
    UserMetricPreference,
    UserIndicatorPreference,
)


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
