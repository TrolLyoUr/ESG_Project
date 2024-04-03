from django.db.models import Sum, F, FloatField, Q
from django.db.models.functions import Coalesce
from .models import MetricIndicator, DataValue


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
            metric_score = -1
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

    # 继续添加其他指标的计算公式...

    def default(self, indicator_values):
        return 0


metric_formulas = {
    "Greenhouse Gas (GHG) Emissions Intensity": MetricFormulas.greenhouse_gas_emissions_intensity,
    "Water Efficiency": MetricFormulas.water_efficiency,
    "Renewable Energy Utilization": MetricFormulas.renewable_energy_utilization,
    "Waste Recycling Rate": MetricFormulas.waste_recycling_rate,
    "Carbon Intensity": MetricFormulas.carbon_intensity,
    "Air Quality Impact": MetricFormulas.air_quality_impact,
    "Gender Pay Equity": MetricFormulas.gender_pay_equity,
    "Diversity in Leadership": MetricFormulas.diversity_in_leadership,
    "Employee Turnover Rate": MetricFormulas.employee_turnover_rate,
    "Workforce Training Investment": MetricFormulas.workforce_training_investment,
    "Labor Relations Quality": MetricFormulas.labor_relations_quality,
    "Health and Safety Performance": MetricFormulas.health_and_safety_performance,
    "Employee Well-being and Engagement": MetricFormulas.employee_wellbeing_and_engagement,
    "Workforce Diversity": MetricFormulas.workforce_diversity,
    "Board Composition and Diversity": MetricFormulas.board_composition_and_diversity,
    "Board Meeting Engagement": MetricFormulas.board_meeting_engagement,
    "Executive Compensation Alignment": MetricFormulas.executive_compensation_alignment,
    "Committee Independence": MetricFormulas.committee_independence,
    "Governance Structure Effectiveness": MetricFormulas.governance_structure_effectiveness,
    "Transparency and Accountability": MetricFormulas.transparency_and_accountability,
    # 继续添加其他指标名称和对应的函数映射...
}


def calculate_metric_formula(metric_name, indicator_values):
    formula_func = metric_formulas.get(metric_name, MetricFormulas.default)
    metric_formulas_instance = MetricFormulas()
    metric_score = formula_func(metric_formulas_instance, indicator_values)
    return metric_score
