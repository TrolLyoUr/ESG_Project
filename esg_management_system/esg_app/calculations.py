from django.db.models import Sum, F, FloatField, Q
from django.db.models.functions import Coalesce
from .models import MetricIndicator, DataValue, FrameworkMetric, Framework


# 计算某公司在所有三个框架下的所有年份的分数
def calculate_all_framework_scores_all_years(company):
    all_frameworks = Framework.objects.all()
    all_years = DataValue.objects.values_list('year', flat=True).distinct()

    company_scores = {}
    
    for framework in all_frameworks:
        company_scores[framework.name] = calculate_framework_scores_all_years(company, framework)
    
    return company_scores


# 计算某公司某框架下所有年份的分数
def calculate_framework_scores_all_years(company, framework):
    framework_metrics = FrameworkMetric.objects.filter(framework=framework)
    framework_scores = {}
    all_years = DataValue.objects.values_list('year', flat=True).distinct()
    
    for year in all_years:
        framework_score_by_year = calculate_framework_score_by_year(company, framework, year)
        if framework_score_by_year > 0:

            framework_scores[year] = scale_score(framework_score_by_year)

    return framework_scores


# 计算某公司某年某Framework下的分数
def calculate_framework_score_by_year(company, framework, year):
    framework_metrics = FrameworkMetric.objects.filter(framework=framework)
    metric_scores = {}

    for framework_metric in framework_metrics:
        metric_score_by_year = calculate_metric_score_by_year(company, framework, framework_metric.metric, year) 

        if metric_score_by_year < 0:
            metric_scores[framework_metric.metric.name] = 0
        else:
            metric_scores[framework_metric.metric.name] = metric_score_by_year

    framework_score = calculate_metric_formula(framework.name, metric_scores)
    return framework_score


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


class ModelFormulas:
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
            metric_score = -1
        return metric_score

    def renewable_energy_utilization(self, indicator_values):
        renew_energy_consumed = indicator_values.get("RENEWENERGYCONSUMED", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        if energy_use_total > 0:
            metric_score = (renew_energy_consumed / energy_use_total) * 100
        else:
            metric_score = -1
        return metric_score

    def waste_recycling_rate(self, indicator_values):
        waste_recycled = indicator_values.get("WASTE_RECYCLED", 0)
        waste_total = indicator_values.get("WASTETOTAL", 0)
        if waste_total > 0:
            metric_score = (waste_recycled / waste_total) * 100
        else:
            metric_score = -1
        return metric_score

    def carbon_intensity(self, indicator_values):
        co2_direct_scope1 = indicator_values.get("CO2DIRECTSCOPE1", 0)
        co2_indirect_scope2 = indicator_values.get("CO2INDIRECTSCOPE2", 0)
        energy_use_total = indicator_values.get("ENERGYUSETOTAL", 0)
        if energy_use_total > 0:
            metric_score = (co2_direct_scope1 + co2_indirect_scope2) / energy_use_total
        else:
            metric_score = -1
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
        greenhouse_gas_emissions_intensity = indicator_values.get("Greenhouse Gas (GHG) Emissions Intensity", 0)
        water_efficiency = indicator_values.get("Water Efficiency", 0)
        renewable_energy_utilization = indicator_values.get("Renewable Energy Utilization", 0)
        waste_recycling_rate = indicator_values.get("Waste Recycling Rate", 0)
        carbon_intensity = indicator_values.get("Carbon Intensity", 0)
        air_quality_impact = indicator_values.get("Air Quality Impact", 0)
        gender_pay_equity = indicator_values.get("Gender Pay Equity", 0)
        diversity_in_leadership = indicator_values.get("Diversity in Leadership", 0)
        employee_turnover_rate = indicator_values.get("Employee Turnover Rate", 0)
        workforce_training_investment = indicator_values.get("Workforce Training Investment", 0)
        labor_relations_quality = indicator_values.get("Labor Relations Quality", 0)
        health_and_safety_performance = indicator_values.get("Health and Safety Performance", 0)
        employee_well_being_and_engagement = indicator_values.get("Employee Well-being and Engagement", 0)
        workforce_diversity = indicator_values.get("Workforce Diversity", 0)
        board_composition_and_diversity = indicator_values.get("Board Composition and Diversity", 0)
        board_meeting_engagement = indicator_values.get("Board Meeting Engagement", 0)
        executive_compensation_alignment = indicator_values.get("Executive Compensation Alignment", 0)
        committee_independence = indicator_values.get("Committee Independence", 0)
        governance_structure_effectiveness = indicator_values.get("Governance Structure Effectiveness", 0)
        transparency_and_accountability = indicator_values.get("Transparency and Accountability", 0)

        metric_score = (
                greenhouse_gas_emissions_intensity * 0.10
                + water_efficiency * 0.05
                + renewable_energy_utilization * 0.10
                + waste_recycling_rate * 0.05
                + carbon_intensity * 0.10
                + air_quality_impact * 0.05
                + gender_pay_equity * 0.05
                + diversity_in_leadership * 0.05
                + employee_turnover_rate * 0.03
                + workforce_training_investment * 0.03
                + labor_relations_quality * 0.05
                + health_and_safety_performance * 0.10
                + employee_well_being_and_engagement * 0.05
                + workforce_diversity * 0.05
                + board_composition_and_diversity * 0.05
                + board_meeting_engagement * 0.03
                + executive_compensation_alignment * 0.05
                + committee_independence * 0.05
                + governance_structure_effectiveness * 0.05
                + transparency_and_accountability * 0.10
        )
        return metric_score

    def sasb(self, indicator_values):
        greenhouse_gas_emissions_intensity = indicator_values.get("Greenhouse Gas (GHG) Emissions Intensity", 0)
        water_efficiency = indicator_values.get("Water Efficiency", 0)
        renewable_energy_utilization = indicator_values.get("Renewable Energy Utilization", 0)
        waste_recycling_rate = indicator_values.get("Waste Recycling Rate", 0)
        carbon_intensity = indicator_values.get("Carbon Intensity", 0)
        air_quality_impact = indicator_values.get("Air Quality Impact", 0)
        gender_pay_equity = indicator_values.get("Gender Pay Equity", 0)
        diversity_in_leadership = indicator_values.get("Diversity in Leadership", 0)
        employee_turnover_rate = indicator_values.get("Employee Turnover Rate", 0)
        workforce_training_investment = indicator_values.get("Workforce Training Investment", 0)
        labor_relations_quality = indicator_values.get("Labor Relations Quality", 0)
        health_and_safety_performance = indicator_values.get("Health and Safety Performance", 0)
        employee_well_being_and_engagement = indicator_values.get("Employee Well-being and Engagement", 0)
        workforce_diversity = indicator_values.get("Workforce Diversity", 0)
        board_composition_and_diversity = indicator_values.get("Board Composition and Diversity", 0)
        board_meeting_engagement = indicator_values.get("Board Meeting Engagement", 0)
        executive_compensation_alignment = indicator_values.get("Executive Compensation Alignment", 0)
        committee_independence = indicator_values.get("Committee Independence", 0)
        governance_structure_effectiveness = indicator_values.get("Governance Structure Effectiveness", 0)
        transparency_and_accountability = indicator_values.get("Transparency and Accountability", 0)

        metric_score = (
                greenhouse_gas_emissions_intensity * 0.08
                + water_efficiency * 0.04
                + renewable_energy_utilization * 0.08
                + waste_recycling_rate * 0.04
                + carbon_intensity * 0.08
                + air_quality_impact * 0.04
                + gender_pay_equity * 0.04
                + diversity_in_leadership * 0.04
                + employee_turnover_rate * 0.03
                + workforce_training_investment * 0.03
                + labor_relations_quality * 0.04
                + health_and_safety_performance * 0.08
                + employee_well_being_and_engagement * 0.04
                + workforce_diversity * 0.04
                + board_composition_and_diversity * 0.04
                + board_meeting_engagement * 0.03
                + executive_compensation_alignment * 0.05
                + committee_independence * 0.05
                + governance_structure_effectiveness * 0.05
                + transparency_and_accountability * 0.08
        )
        return metric_score

    def tcfd(self, indicator_values):
        greenhouse_gas_emissions_intensity = indicator_values.get("Greenhouse Gas (GHG) Emissions Intensity", 0)
        renewable_energy_utilization = indicator_values.get("Renewable Energy Utilization", 0)
        carbon_intensity = indicator_values.get("Carbon Intensity", 0)
        health_and_safety_performance = indicator_values.get("Health and Safety Performance", 0)
        governance_structure_effectiveness = indicator_values.get("Governance Structure Effectiveness", 0)
        transparency_and_accountability = indicator_values.get("Transparency and Accountability", 0)

        metric_score = (
                greenhouse_gas_emissions_intensity * 0.20
                + renewable_energy_utilization * 0.20
                + carbon_intensity * 0.20
                + health_and_safety_performance * 0.10
                + governance_structure_effectiveness * 0.15
                + transparency_and_accountability * 0.15
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

# 数据放缩处理
def scale_score(score):
    if score > 1000:
        score = score%1000
        score = 90+score/1000
    elif score >300:
        score = (score-200)/10+20
    elif score > 10:
        score = score/25
    return score
