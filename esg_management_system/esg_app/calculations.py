from django.db.models import Sum, F, FloatField, Q
from django.db.models.functions import Coalesce
from .models import MetricIndicator, DataValue, FrameworkMetric


# 计算某公司某年某Framework下的分数
def calculate_framework_score_by_year(company, framework, year):
    framework_metrics = FrameworkMetric.objects.filter(framework=framework)
    indicator_values = {}

    for framework_metric in framework_metrics:
        metric = framework_metric.metric

        metric_indicators = MetricIndicator.objects.filter(metric=metric)

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
                .filter(year=year)
                .order_by("-year")
                .first()
            )

            if data_value:
                value = data_value.value
                indicator_values[indicator.name] = value * predefined_weight

    framework_score = calculate_metric_formula(framework.name, indicator_values)
    return framework_score


# 返回某公司在某框架下最新一年的指定metric值，已过时。但为了已实现API保留。
def calculate_metric_score(company, framework, metric):
    metric_indicators = MetricIndicator.objects.filter(metric=metric)
    indicator_values = {}

    for metric_indicator in metric_indicators:
        indicator = metric_indicator.indicator
        # 这里的weight需要改为用户自定义的weight
        predefined_weight = metric_indicator.predefined_weight

        data_value = (
            DataValue.objects.filter(company=company, indicator=indicator)
            .filter(
                Q(
                    company__data_values__indicator__metric_indicators__metric__framework_metrics__framework=framework
                )
            )
            .order_by("-year")
            # 想要检索特定年份只需修改这里
            .first()
        )

        if data_value:
            value = data_value.value
            indicator_values[indicator.name] = value * predefined_weight

    metric_score = calculate_metric_formula(metric.name, indicator_values)
    return metric_score


# 替代calculate_metric_score，添加了一个年份参数
def calculate_metric_score_by_year(company, framework, metric, year):
    metric_indicators = MetricIndicator.objects.filter(metric=metric)
    indicator_values = {}

    for metric_indicator in metric_indicators:
        indicator = metric_indicator.indicator
        # 这里的weight需要改为用户自定义的weight
        predefined_weight = metric_indicator.predefined_weight

        data_value = (
            DataValue.objects.filter(company=company, indicator=indicator)
            .filter(
                Q(
                    company__data_values__indicator__metric_indicators__metric__framework_metrics__framework=framework
                )
            )
            .filter(year=year)
            .order_by("-year")
            .first()
        )

        if data_value:
            value = data_value.value
            indicator_values[indicator.name] = value * predefined_weight

    metric_score = calculate_metric_formula(metric.name, indicator_values)
    return metric_score


class ModelFormulas:
    def greenhouse_gas_emissions_intensity(self, indicator_values):
        co2_direct_scope1 = indicator_values.get("CO2DIRECTSCOPE1", 0)
        co2_indirect_scope2 = indicator_values.get("CO2INDIRECTSCOPE2", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        print(co2_direct_scope1, co2_indirect_scope2, energy_use_total)
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

    def renewable_energy_utilization(self, indicator_values):
        renew_energy_consumed = indicator_values.get("RENEWENERGYCONSUMED", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        if energy_use_total > 0:
            metric_score = (renew_energy_consumed / energy_use_total) * 100
        else:
            metric_score = 0
        return metric_score

    def waste_recycling_rate(self, indicator_values):
        waste_recycled = indicator_values.get("WASTE_RECYCLED", 0)
        waste_total = indicator_values.get("WASTETOTAL", 0)
        if waste_total > 0:
            metric_score = (waste_recycled / waste_total) * 100
        else:
            metric_score = 0
        return metric_score

    def carbon_intensity(self, indicator_values):
        co2_direct_scope1 = indicator_values.get("CO2DIRECTSCOPE1", 0)
        co2_indirect_scope2 = indicator_values.get("CO2INDIRECTSCOPE2", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        if energy_use_total > 0:
            metric_score = (co2_direct_scope1 + co2_indirect_scope2) / energy_use_total
        else:
            metric_score = 0
        return metric_score

    def air_quality_impact(self, indicator_values):
        sox_emissions = indicator_values.get("SOXEMISSIONS", 0)
        nox_emissions = indicator_values.get("NOXEMISSIONS", 0)
        particulate_matter_emissions = indicator_values.get(
            "PARTICULATE_MATTER_EMISSIONS", 0
        )
        metric_score = sox_emissions + nox_emissions + particulate_matter_emissions
        return metric_score

    def gender_pay_equity(self, indicator_values):
        gender_pay_gap_percentage = indicator_values.get("GENDER_PAY_GAP_PERCENTAGE", 0)
        metric_score = gender_pay_gap_percentage
        return metric_score

    def diversity_in_leadership(self, indicator_values):
        women_managers = indicator_values.get("WOMENMANAGERS", 0)
        indep_board = indicator_values.get("ANALYTICINDEPBOARD", 0)
        board_female = indicator_values.get("ANALYTICBOARDFEMALE", 0)
        metric_score = (women_managers + indep_board + board_female) / 3
        return metric_score

    def employee_turnover_rate(self, indicator_values):
        turnover_employees = indicator_values.get("TURNOVEREMPLOYEES", 0)
        metric_score = turnover_employees
        return metric_score

    def workforce_training_investment(self, indicator_values):
        avg_training_hours = indicator_values.get("AVGTRAININGHOURS", 0)
        metric_score = avg_training_hours
        return metric_score

    def labor_relations_quality(self, indicator_values):
        trade_union_rep = indicator_values.get("TRADEUNIONREP", 0)
        metric_score = trade_union_rep
        return metric_score

    def health_and_safety_performance(self, indicator_values):
        tir_total = indicator_values.get("TIRTOTAL", 0)
        lost_working_days = indicator_values.get("LOSTWORKINGDAYS", 0)
        employee_fatalities = indicator_values.get("EMPLOYEEFATALITIES", 0)
        metric_score = (
            tir_total + (lost_working_days / 1000) + employee_fatalities
        ) / 3
        return metric_score

    def employee_wellbeing_and_engagement(self, indicator_values):
        comm_meetings_attendance_avg = indicator_values.get(
            "COMMMEETINGSATTENDANCEAVG", 0
        )
        board_meeting_attendance_avg = indicator_values.get(
            "BOARDMEETINGATTENDANCEAVG", 0
        )
        metric_score = (comm_meetings_attendance_avg + board_meeting_attendance_avg) / 2
        return metric_score

    def workforce_diversity(self, indicator_values):
        women_employees = indicator_values.get("WOMENEMPLOYEES", 0)
        board_female = indicator_values.get("ANALYTICBOARDFEMALE", 0)
        metric_score = (women_employees + board_female) / 2
        return metric_score

    def board_composition_and_diversity(self, indicator_values):
        indep_board = indicator_values.get("ANALYTICINDEPBOARD", 0)
        board_female = indicator_values.get("ANALYTICBOARDFEMALE", 0)
        non_exec_board = indicator_values.get("ANALYTICNONEXECBOARD", 0)
        metric_score = (indep_board + board_female + non_exec_board) / 3
        return metric_score

    def board_meeting_engagement(self, indicator_values):
        board_meeting_attendance_avg = indicator_values.get(
            "BOARDMEETINGATTENDANCEAVG", 0
        )
        comm_meetings_attendance_avg = indicator_values.get(
            "COMMMEETINGSATTENDANCEAVG", 0
        )
        metric_score = (board_meeting_attendance_avg + comm_meetings_attendance_avg) / 2
        return metric_score

    def executive_compensation_alignment(self, indicator_values):
        ceo_pay_ratio_median = indicator_values.get("CEO_PAY_RATIO_MEDIAN", 0)
        non_audit_audit_fees_ratio = indicator_values.get(
            "ANALYTICNONAUDITAUDITFEESRATIO", 0
        )
        metric_score = (ceo_pay_ratio_median + (1 - non_audit_audit_fees_ratio)) / 2
        return metric_score

    def committee_independence(self, indicator_values):
        audit_comm_ind = indicator_values.get("ANALYTICAUDITCOMMIND", 0)
        comp_comm_ind = indicator_values.get("ANALYTICCOMPCOMMIND", 0)
        nomination_comm_ind = indicator_values.get("ANALYTICNOMINATIONCOMMIND", 0)
        metric_score = (audit_comm_ind + comp_comm_ind + nomination_comm_ind) / 3
        return metric_score

    def governance_structure_effectiveness(self, indicator_values):
        non_exec_board = indicator_values.get("ANALYTICNONEXECBOARD", 0)
        indep_board = indicator_values.get("ANALYTICINDEPBOARD", 0)
        board_meeting_attendance_avg = indicator_values.get(
            "BOARDMEETINGATTENDANCEAVG", 0
        )
        metric_score = (
            non_exec_board + indep_board + (board_meeting_attendance_avg / 100)
        ) / 3
        return metric_score

    def transparency_and_accountability(self, indicator_values):
        non_audit_audit_fees_ratio = indicator_values.get(
            "ANALYTICNONAUDITAUDITFEESRATIO", 0
        )
        audit_comm_non_exec_members = indicator_values.get("AUDITCOMMNONEXECMEMBERS", 0)
        comp_comm_non_exec_members = indicator_values.get("COMPCOMMNONEXECMEMBERS", 0)
        metric_score = (
            1
            - non_audit_audit_fees_ratio
            + audit_comm_non_exec_members
            + comp_comm_non_exec_members
        ) / 3
        return metric_score

    def gri(self, indicator_values):
        metric_score = (
            indicator_values["Greenhouse Gas (GHG) Emissions Intensity"] * 0.10
            + indicator_values["Water Efficiency"] * 0.05
            + indicator_values["Renewable Energy Utilization"] * 0.10
            + indicator_values["Waste Recycling Rate"] * 0.05
            + indicator_values["Carbon Intensity"] * 0.10
            + indicator_values["Air Quality Impact"] * 0.05
            + indicator_values["Gender Pay Equity"] * 0.05
            + indicator_values["Diversity in Leadership"] * 0.05
            + indicator_values["Employee Turnover Rate"] * 0.03
            + indicator_values["Workforce Training Investment"] * 0.03
            + indicator_values["Labor Relations Quality"] * 0.05
            + indicator_values["Health and Safety Performance"] * 0.10
            + indicator_values["Employee Well-being and Engagement"] * 0.05
            + indicator_values["Workforce Diversity"] * 0.05
            + indicator_values["Board Composition and Diversity"] * 0.05
            + indicator_values["Board Meeting Engagement"] * 0.03
            + indicator_values["Executive Compensation Alignment"] * 0.05
            + indicator_values["Committee Independence"] * 0.05
            + indicator_values["Governance Structure Effectiveness"] * 0.05
            + indicator_values["Transparency and Accountability"] * 0.10
        )
        return metric_score

    def sasb(self, indicator_scores):
        metric_score = (
            indicator_scores["Greenhouse Gas (GHG) Emissions Intensity"] * 0.08
            + indicator_scores["Water Efficiency"] * 0.04
            + indicator_scores["Renewable Energy Utilization"] * 0.08
            + indicator_scores["Waste Recycling Rate"] * 0.04
            + indicator_scores["Carbon Intensity"] * 0.08
            + indicator_scores["Air Quality Impact"] * 0.04
            + indicator_scores["Gender Pay Equity"] * 0.04
            + indicator_scores["Diversity in Leadership"] * 0.04
            + indicator_scores["Employee Turnover Rate"] * 0.03
            + indicator_scores["Workforce Training Investment"] * 0.03
            + indicator_scores["Labor Relations Quality"] * 0.04
            + indicator_scores["Health and Safety Performance"] * 0.08
            + indicator_scores["Employee Well-being and Engagement"] * 0.04
            + indicator_scores["Workforce Diversity"] * 0.04
            + indicator_scores["Board Composition and Diversity"] * 0.04
            + indicator_scores["Board Meeting Engagement"] * 0.03
            + indicator_scores["Executive Compensation Alignment"] * 0.05
            + indicator_scores["Committee Independence"] * 0.05
            + indicator_scores["Governance Structure Effectiveness"] * 0.05
            + indicator_scores["Transparency and Accountability"] * 0.08
        )
        return metric_score

    def tcfd(self, indicator_scores):
        metric_score = (
            indicator_scores["Greenhouse Gas (GHG) Emissions Intensity"] * 0.20
            + indicator_scores["Renewable Energy Utilization"] * 0.20
            + indicator_scores["Carbon Intensity"] * 0.20
            + indicator_scores["Health and Safety Performance"] * 0.10
            + indicator_scores["Governance Structure Effectiveness"] * 0.15
            + indicator_scores["Transparency and Accountability"] * 0.15
        )
        return metric_score

    # 继续添加其他指标的计算公式...

    def default(self, indicator_values):
        return 0


model_formulas = {
    "Greenhouse Gas (GHG) Emissions Intensity": ModelFormulas.greenhouse_gas_emissions_intensity,
    "Water Efficiency": ModelFormulas.water_efficiency,
    "Renewable Energy Utilization": ModelFormulas.renewable_energy_utilization,
    "Waste Recycling Rate": ModelFormulas.waste_recycling_rate,
    "Carbon Intensity": ModelFormulas.carbon_intensity,
    "Air Quality Impact": ModelFormulas.air_quality_impact,
    "Gender Pay Equity": ModelFormulas.gender_pay_equity,
    "Diversity in Leadership": ModelFormulas.diversity_in_leadership,
    "Employee Turnover Rate": ModelFormulas.employee_turnover_rate,
    "Workforce Training Investment": ModelFormulas.workforce_training_investment,
    "Labor Relations Quality": ModelFormulas.labor_relations_quality,
    "Health and Safety Performance": ModelFormulas.health_and_safety_performance,
    "Employee Well-being and Engagement": ModelFormulas.employee_wellbeing_and_engagement,
    "Workforce Diversity": ModelFormulas.workforce_diversity,
    "Board Composition and Diversity": ModelFormulas.board_composition_and_diversity,
    "Board Meeting Engagement": ModelFormulas.board_meeting_engagement,
    "Executive Compensation Alignment": ModelFormulas.executive_compensation_alignment,
    "Committee Independence": ModelFormulas.committee_independence,
    "Governance Structure Effectiveness": ModelFormulas.governance_structure_effectiveness,
    "Transparency and Accountability": ModelFormulas.transparency_and_accountability,
    "GRI": ModelFormulas.gri,
    "SASB": ModelFormulas.sasb,
    "TCFD": ModelFormulas.tcfd,
    # 继续添加其他指标名称和对应的函数映射...
}


def calculate_metric_formula(model_name, indicator_values):
    formula_func = model_formulas.get(model_name, ModelFormulas.default)
    model_formulas_instance = ModelFormulas()
    model_score = formula_func(model_formulas_instance, indicator_values)

    return model_score
