from django.core.management.base import BaseCommand
from esg_app.models import Framework, Metric, Indicator, FrameworkMetric, MetricIndicator

class Command(BaseCommand):
    help = 'Populate the database with predefined metrics and related information.'

    def handle(self, *args, **kwargs):
        # Define your metrics and related data
        e_metrics_data = [
            # GHG Emissions Intensity - GRI
            {
                'name': 'Greenhouse Gas (GHG) Emissions Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, CO2INDIRECTSCOPE3, ENERGYUSETOTAL. '
                            'Includes comprehensive Scope 1, 2, and 3 emissions to fully represent the organization\'s GHG footprint. '
                            'Formula: GHG Emissions Intensity for GRI = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2 + CO2INDIRECTSCOPE3) / ENERGYUSETOTAL.',
                'frameworks': 'GRI',
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'CO2INDIRECTSCOPE3', 'ENERGYUSETOTAL'],
            },
            # GHG Emissions Intensity - SASB
            {
                'name': 'Greenhouse Gas (GHG) Emissions Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ENERGYUSETOTAL. '
                            'Focuses on the most material and sector-specific Scope 1 and 2 emissions for investor-relevant reporting. '
                            'Formula: GHG Emissions Intensity for SASB = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2) / ENERGYUSETOTAL.',
                'frameworks': 'SASB',
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL'],
            },
            # GHG Emissions Intensity - TCFD
            {
                'name': 'Greenhouse Gas (GHG) Emissions Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ENERGYUSETOTAL, TRANALYTICRENEWENERGYUSE. '
                            'Incorporates current emissions and the proportion of renewable energy to reflect climate-related risks and opportunities. '
                            'Formula: GHG Emissions Intensity for TCFD = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2) / (ENERGYUSETOTAL * (1 + TRANALYTICRENEWENERGYUSE/100)).',
                'frameworks': 'TCFD',
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL', 'TRANALYTICRENEWENERGYUSE'],
            },
            # Water Efficiency - GRI
            {
                'name': 'Water Efficiency',
                'description': 'Indicators Used: WATERWITHDRAWALTOTAL, ENERGYUSETOTAL. '
                            'Measures the total water withdrawal in relation to energy use, indicating efficiency in water-intensive industries. '
                            'Formula: Water Efficiency for GRI = WATERWITHDRAWALTOTAL / ENERGYUSETOTAL.',
                'frameworks': 'GRI',
                'indicators': ['WATERWITHDRAWALTOTAL', 'ENERGYUSETOTAL'],
            },
            # Water Efficiency - SASB
            {
                'name': 'Water Efficiency',
                'description': 'Indicators Used: WATERWITHDRAWALTOTAL, ELECTRICITYPURCHASED. '
                            'Reflects water usage efficiency in relation to energy purchased, focusing on direct operational impacts. '
                            'Formula: Water Efficiency for SASB = WATERWITHDRAWALTOTAL / ELECTRICITYPURCHASED.',
                'frameworks': 'SASB',
                'indicators': ['WATERWITHDRAWALTOTAL', 'ELECTRICITYPURCHASED'],
            },
            # Renewable Energy Utilization - GRI
            {
                'name': 'Renewable Energy Utilization',
                'description': 'Indicators Used: RENEWENERGYCONSUMED, ENERGYUSETOTAL. '
                            'Evaluates the percentage of total energy use met through renewable sources. '
                            'Formula: Renewable Energy Utilization for GRI = (RENEWENERGYCONSUMED / ENERGYUSETOTAL) * 100%.',
                'frameworks': 'GRI',
                'indicators': ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
            },
            # Renewable Energy Utilization - SASB
            {
                'name': 'Renewable Energy Utilization',
                'description': 'Indicators Used: RENEWENERGYCONSUMED, ENERGYUSETOTAL. '
                            'Concentrates on renewable energy in the context of industry-specific energy consumption. '
                            'Formula: Renewable Energy Utilization for SASB = (RENEWENERGYCONSUMED / ENERGYUSETOTAL) * 100%.',
                'frameworks': 'SASB',
                'indicators': ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
            },
            # Renewable Energy Utilization - TCFD
            {
                'name': 'Renewable Energy Utilization',
                'description': 'Indicators Used: RENEWENERGYCONSUMED, ENERGYUSETOTAL. '
                            'Includes renewable energy consumption as a factor for climate change mitigation strategy. '
                            'Formula: Renewable Energy Utilization for TCFD = (RENEWENERGYCONSUMED / ENERGYUSETOTAL) * 100%.',
                'frameworks': 'TCFD',
                'indicators': ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
            },
                # Waste Recycling Rate - GRI
            {
                'name': 'Waste Recycling Rate',
                'description': 'Indicators Used: WASTE_RECYCLED, WASTETOTAL. '
                            'Represents the organization\'s efforts in waste management by measuring the proportion of waste that is recycled. '
                            'Formula: Waste Recycling Rate for GRI = (WASTE_RECYCLED / WASTETOTAL) * 100%.',
                'frameworks': 'GRI',
                'indicators': ['WASTE_RECYCLED', 'WASTETOTAL'],
            },
            # Waste Recycling Rate - SASB
            {
                'name': 'Waste Recycling Rate',
                'description': 'Indicator Used: ANALYTICWASTERECYCLINGRATIO. '
                            'Focuses on the recycling ratio to illustrate waste management efficiency specific to the industry. '
                            'Formula: Waste Recycling Rate for SASB = ANALYTICWASTERECYCLINGRATIO.',
                'frameworks': 'SASB',
                'indicators': ['ANALYTICWASTERECYCLINGRATIO'],
            },
            # Carbon Intensity - GRI
            {
                'name': 'Carbon Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ENERGYUSETOTAL. '
                            'Measures carbon emissions per unit of energy, providing insight into the organization\'s carbon footprint. '
                            'Formula: Carbon Intensity for GRI = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2) / ENERGYUSETOTAL.',
                'frameworks': 'GRI',
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL'],
            },
            # Carbon Intensity - SASB
            {
                'name': 'Carbon Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ANNUAL_MEDIAN_COMPENSATION. '
                            'Adapts the carbon intensity metric to reflect emissions in relation to the company\'s financial scale, measured by median annual compensation. '
                            'Formula: Carbon Intensity for SASB = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2) / ANNUAL_MEDIAN_COMPENSATION.',
                'frameworks': 'SASB',
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ANNUAL_MEDIAN_COMPENSATION'],
            },
            # Carbon Intensity - TCFD
            {
                'name': 'Carbon Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ENERGYUSETOTAL, CO2_NO_EQUIVALENTS. '
                            'Includes not only current emissions but also direct CO2 emissions, reflecting comprehensive climate-related financial risks. '
                            'Formula: Carbon Intensity for TCFD = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2 + CO2_NO_EQUIVALENTS) / ENERGYUSETOTAL.',
                'frameworks': 'TCFD',
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL', 'CO2_NO_EQUIVALENTS'],
            },
            # Air Quality Impact - GRI
            {
                'name': 'Air Quality Impact',
                'description': 'Indicators Used: SOXEMISSIONS, NOXEMISSIONS, PARTICULATE_MATTER_EMISSIONS. '
                            'Aggregates emissions data to reflect the total impact of operations on air quality. '
                            'Air Quality Impact for GRI = Sum of SOXEMISSIONS, NOXEMISSIONS, and PARTICULATE_MATTER_EMISSIONS.',
                'frameworks': 'GRI',
                'indicators': ['SOXEMISSIONS', 'NOXEMISSIONS', 'PARTICULATE_MATTER_EMISSIONS'],
            },
            # Air Quality Impact - SASB
            {
                'name': 'Air Quality Impact',
                'description': 'Indicators Used: SOXEMISSIONS, NOXEMISSIONS, PARTICULATE_MATTER_EMISSIONS. '
                            'Tailors emissions reporting to material air quality concerns pertinent to the company\'s sector. '
                            'Air Quality Impact for SASB = Sector-Specific Adjustment of SOXEMISSIONS, NOXEMISSIONS, and PARTICULATE_MATTER_EMISSIONS.',
                'frameworks': 'SASB',
                'indicators': ['SOXEMISSIONS', 'NOXEMISSIONS', 'PARTICULATE_MATTER_EMISSIONS'],
            },
        ]


        s_metrics_data = [
            # Gender Pay Equity - GRI
            {
                'name': 'Gender Pay Equity',
                'description': 'Indicator Used: GENDER_PAY_GAP_PERCENTAGE. '
                            'Measures the overall gender pay gap in the organization, emphasizing the commitment to gender equality. '
                            'Formula: Gender Pay Equity for GRI = GENDER_PAY_GAP_PERCENTAGE.',
                'frameworks': 'GRI',
                'indicators': ['GENDER_PAY_GAP_PERCENTAGE'],
            },
            # Gender Pay Equity - SASB
            {
                'name': 'Gender Pay Equity',
                'description': 'Indicators Used: GENDER_PAY_GAP_PERCENTAGE, ANNUAL_MEDIAN_COMPENSATION, CEO_ANNUAL_COMPENSATION. '
                            'Places the gender pay gap in the context of broader compensation trends, including median employee compensation and CEO pay. '
                            'Formula: Gender Pay Equity for SASB = GENDER_PAY_GAP_PERCENTAGE.',
                'frameworks': 'SASB',
                'indicators': ['GENDER_PAY_GAP_PERCENTAGE', 'ANNUAL_MEDIAN_COMPENSATION', 'CEO_ANNUAL_COMPENSATION'],
            },
            # Diversity in Leadership - GRI
            {
                'name': 'Diversity in Leadership',
                'description': 'Indicators Used: WOMENMANAGERS, ANALYTICBOARDFEMALE. '
                            'Focuses on women\'s representation in management and on the board. '
                            'Formula: Diversity in Leadership for GRI = (WOMENMANAGERS + ANALYTICBOARDFEMALE) / 2.',
                'frameworks': 'GRI',
                'indicators': ['WOMENMANAGERS', 'ANALYTICBOARDFEMALE'],
            },
            # Diversity in Leadership - SASB
            {
                'name': 'Diversity in Leadership',
                'description': 'Indicators Used: WOMENMANAGERS, ANALYTICINDEPBOARD, ANALYTICBOARDFEMALE. '
                            'Reflects diversity in management positions and board composition, including independent directors. '
                            'Formula: Diversity in Leadership for SASB = (WOMENMANAGERS + ANALYTICINDEPBOARD + ANALYTICBOARDFEMALE) / 3.',
                'frameworks': 'SASB',
                'indicators': ['WOMENMANAGERS', 'ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE'],
            },
            # Employee Turnover Rate - GRI
            {
                'name': 'Employee Turnover Rate',
                'description': 'Indicator Used: TURNOVEREMPLOYEES. '
                            'Assesses the rate at which employees leave the organization, providing a general indicator of workplace stability. '
                            'Formula: Employee Turnover Rate for GRI = TURNOVEREMPLOYEES.',
                'frameworks': 'GRI',
                'indicators': ['TURNOVEREMPLOYEES'],
            },
            # Employee Turnover Rate - SASB
            {
                'name': 'Employee Turnover Rate',
                'description': 'Indicator Used: TURNOVEREMPLOYEES. '
                            'Analyzes turnover rates with an emphasis on industry comparison to inform investors. '
                            'Formula: Employee Turnover Rate for SASB = TURNOVEREMPLOYEES.',
                'frameworks': 'SASB',
                'indicators': ['TURNOVEREMPLOYEES'],
            },
            # Workforce Training Investment - GRI
            {
                'name': 'Workforce Training Investment',
                'description': 'Indicator Used: AVGTRAININGHOURS. '
                            'Captures the average hours of training provided to employees, signaling investment in workforce capabilities. '
                            'Formula: Workforce Training Investment for GRI = AVGTRAININGHOURS.',
                'frameworks': 'GRI',
                'indicators': ['AVGTRAININGHOURS'],
            },
            # Workforce Training Investment - SASB
            {
                'name': 'Workforce Training Investment',
                'description': 'Indicator Used: AVGTRAININGHOURS. '
                            'Indicates the company\'s focus on employee development as a part of its human capital management. '
                            'Formula: Workforce Training Investment for SASB = AVGTRAININGHOURS.',
                'frameworks': 'SASB',
                'indicators': ['AVGTRAININGHOURS'],
            },
            # Labor Relations Quality - GRI
            {
                'name': 'Labor Relations Quality',
                'description': 'Indicator Used: TRADEUNIONREP. '
                            'Highlights the percentage of employees covered by collective bargaining agreements. '
                            'Formula: Labor Relations Quality for GRI = TRADEUNIONREP.',
                'frameworks': 'GRI',
                'indicators': ['TRADEUNIONREP'],
            },
            # Labor Relations Quality - SASB
            {
                'name': 'Labor Relations Quality',
                'description': 'Indicator Used: TRADEUNIONREP. '
                            'Reports on trade union representation to gauge the strength of labor relations and employee advocacy. '
                            'Formula: Labor Relations Quality for SASB = TRADEUNIONREP.',
                'frameworks': 'SASB',
                'indicators': ['TRADEUNIONREP'],
            },
            # Health and Safety Performance - GRI
            {
                'name': 'Health and Safety Performance',
                'description': 'Indicators Used: TIRTOTAL, LOSTWORKINGDAYS, EMPLOYEEFATALITIES. '
                            'Reflects the overall health and safety conditions within the company by combining injury rates, lost days, and fatalities. '
                            'Formula: Health and Safety Performance for GRI = (TIRTOTAL + LOSTWORKINGDAYS/1000 + EMPLOYEEFATALITIES) / 3.',
                'frameworks': 'GRI',
                'indicators': ['TIRTOTAL', 'LOSTWORKINGDAYS', 'EMPLOYEEFATALITIES'],
            },
            # Health and Safety Performance - SASB
            {
                'name': 'Health and Safety Performance',
                'description': 'Indicators Used: TIRTOTAL, LOSTWORKINGDAYS. '
                            'Emphasizes safety metrics that are particularly material for investors by focusing on injury rates and lost working days. '
                            'Formula: Health and Safety Performance for SASB = (TIRTOTAL + LOSTWORKINGDAYS/1000) / 2.',
                'frameworks': 'SASB',
                'indicators': ['TIRTOTAL', 'LOSTWORKINGDAYS'],
            },
            # Employee Well-being and Engagement - GRI
            {
                'name': 'Employee Well-being and Engagement',
                'description': 'Indicator Used: COMMMEETINGSATTENDANCEAVG. '
                            'Uses the average attendance at committee meetings as a proxy for employee engagement. '
                            'Formula: Employee Well-being and Engagement for GRI = COMMMEETINGSATTENDANCEAVG.',
                'frameworks': 'GRI',
                'indicators': ['COMMMEETINGSATTENDANCEAVG'],
            },
            # Employee Well-being and Engagement - SASB
            {
                'name': 'Employee Well-being and Engagement',
                'description': 'Indicator Used: BOARDMEETINGATTENDANCEAVG. '
                            'Considers board meeting attendance as an indicator of governance commitment, which can impact overall employee engagement. '
                            'Formula: Employee Well-being and Engagement for SASB = BOARDMEETINGATTENDANCEAVG.',
                'frameworks': 'SASB',
                'indicators': ['BOARDMEETINGATTENDANCEAVG'],
            },
            # Workforce Diversity - GRI
            {
                'name': 'Workforce Diversity',
                'description': 'Indicator Used: WOMENEMPLOYEES. '
                            'Measures the representation of women in the total workforce. '
                            'Formula: Workforce Diversity for GRI = WOMENEMPLOYEES.',
                'frameworks': 'GRI',
                'indicators': ['WOMENEMPLOYEES'],
            },
            # Workforce Diversity - SASB
            {
                'name': 'Workforce Diversity',
                'description': 'Indicators Used: WOMENEMPLOYEES, ANALYTICBOARDFEMALE. '
                            'Evaluates the proportion of women across all levels of the company, including the board. '
                            'Formula: Workforce Diversity for SASB = (WOMENEMPLOYEES + ANALYTICBOARDFEMALE) / 2.',
                'frameworks': 'SASB',
                'indicators': ['WOMENEMPLOYEES', 'ANALYTICBOARDFEMALE'],
            },
        ]


        g_metrics_data = [
            # Board Composition and Diversity - GRI
            {
                'name': 'Board Composition and Diversity',
                'description': 'Indicators Used: ANALYTICINDEPBOARD, ANALYTICBOARDFEMALE. '
                            'Measures board diversity by focusing on the representation of independent and female members. '
                            'Formula: Board Composition and Diversity for GRI = (ANALYTICINDEPBOARD + ANALYTICBOARDFEMALE) / 2.',
                'frameworks': 'GRI',
                'indicators': ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE'],
            },
            # Board Composition and Diversity - SASB
            {
                'name': 'Board Composition and Diversity',
                'description': 'Indicators Used: ANALYTICINDEPBOARD, ANALYTICBOARDFEMALE, ANALYTICNONEXECBOARD. '
                            'Evaluates board composition by considering the balance between independent, female, and non-executive members. '
                            'Formula: Board Composition and Diversity for SASB = (ANALYTICINDEPBOARD + ANALYTICBOARDFEMALE + ANALYTICNONEXECBOARD) / 3.',
                'frameworks': 'SASB',
                'indicators': ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE', 'ANALYTICNONEXECBOARD'],
            },
            # Board Meeting Engagement - GRI
            {
                'name': 'Board Meeting Engagement',
                'description': 'Indicator Used: BOARDMEETINGATTENDANCEAVG. '
                            'Focuses on the attendance of board members at board meetings as a measure of engagement. '
                            'Formula: Board Meeting Engagement for GRI = BOARDMEETINGATTENDANCEAVG.',
                'frameworks': 'GRI',
                'indicators': ['BOARDMEETINGATTENDANCEAVG'],
            },
            # Board Meeting Engagement - SASB
            {
                'name': 'Board Meeting Engagement',
                'description': 'Indicators Used: BOARDMEETINGATTENDANCEAVG, COMMMEETINGSATTENDANCEAVG. '
                            'Considers both board and committee meeting attendance rates to gauge the engagement of governance bodies. '
                            'Formula: Board Meeting Engagement for SASB = (BOARDMEETINGATTENDANCEAVG + COMMMEETINGSATTENDANCEAVG) / 2.',
                'frameworks': 'SASB',
                'indicators': ['BOARDMEETINGATTENDANCEAVG', 'COMMMEETINGSATTENDANCEAVG'],
            },
            # Executive Compensation Alignment - GRI
            {
                'name': 'Executive Compensation Alignment',
                'description': 'Indicator Used: CEO_PAY_RATIO_MEDIAN. '
                            'Assesses the fairness of executive compensation in relation to the median employee pay. '
                            'Formula: Executive Compensation Alignment for GRI = CEO_PAY_RATIO_MEDIAN.',
                'frameworks': 'GRI',
                'indicators': ['CEO_PAY_RATIO_MEDIAN'],
            },
            # Executive Compensation Alignment - SASB
            {
                'name': 'Executive Compensation Alignment',
                'description': 'Indicators Used: CEO_PAY_RATIO_MEDIAN, ANALYTICNONAUDITAUDITFEESRATIO. '
                            'Evaluates executive compensation not only in terms of employee pay parity but also in relation to the proportion of audit to non-audit fees to reflect financial stewardship. '
                            'Formula: Executive Compensation Alignment for SASB = (CEO_PAY_RATIO_MEDIAN + (1 - ANALYTICNONAUDITAUDITFEESRATIO)) / 2.',
                'frameworks': 'SASB',
                'indicators': ['CEO_PAY_RATIO_MEDIAN', 'ANALYTICNONAUDITAUDITFEESRATIO'],
            },
            # Committee Independence - GRI
            {
                'name': 'Committee Independence',
                'description': 'Indicators Used: ANALYTICAUDITCOMMIND, ANALYTICCOMPCOMMIND. '
                            'Highlights the independence of audit and compensation committees as a measure of good governance practices. '
                            'Formula: Committee Independence for GRI = (ANALYTICAUDITCOMMIND + ANALYTICCOMPCOMMIND) / 2.',
                'frameworks': 'GRI',
                'indicators': ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND'],
            },
            # Committee Independence - SASB
            {
                'name': 'Committee Independence',
                'description': 'Indicators Used: ANALYTICAUDITCOMMIND, ANALYTICCOMPCOMMIND, ANALYTICNOMINATIONCOMMIND. '
                            'Broadens the scope of committee independence assessment to include the nomination committee, providing a more comprehensive view of governance. '
                            'Formula: Committee Independence for SASB = (ANALYTICAUDITCOMMIND + ANALYTICCOMPCOMMIND + ANALYTICNOMINATIONCOMMIND) / 3.',
                'frameworks': 'SASB',
                'indicators': ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND', 'ANALYTICNOMINATIONCOMMIND'],
            },
            # Governance Structure Effectiveness - GRI
            {
                'name': 'Governance Structure Effectiveness',
                'description': 'Indicators Used: ANALYTICNONEXECBOARD, ANALYTICINDEPBOARD. '
                            'Measures the effectiveness of the governance structure through the lens of non-executive and independent board representation. '
                            'Formula: Governance Structure Effectiveness for GRI = (ANALYTICNONEXECBOARD + ANALYTICINDEPBOARD) / 2.',
                'frameworks': 'GRI',
                'indicators': ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD'],
            },
            # Governance Structure Effectiveness - SASB
            {
                'name': 'Governance Structure Effectiveness',
                'description': 'Indicators Used: ANALYTICNONEXECBOARD, ANALYTICINDEPBOARD, BOARDMEETINGATTENDANCEAVG. '
                            'Incorporates board meeting attendance to the assessment of governance structure, emphasizing active participation. '
                            'Formula: Governance Structure Effectiveness for SASB = (ANALYTICNONEXECBOARD + ANALYTICINDEPBOARD + BOARDMEETINGATTENDANCEAVG / 100) / 3.',
                'frameworks': 'SASB',
                'indicators': ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD', 'BOARDMEETINGATTENDANCEAVG'],
            },
            # Transparency and Accountability - GRI
            {
                'name': 'Transparency and Accountability',
                'description': 'Indicator Used: ANALYTICNONAUDITAUDITFEESRATIO. '
                            'Focuses on the ratio of non-audit to audit fees as a measure of transparency in financial reporting. '
                            'Formula: Transparency and Accountability for GRI = 1 - ANALYTICNONAUDITAUDITFEESRATIO.',
                'frameworks': 'GRI',
                'indicators': ['ANALYTICNONAUDITAUDITFEESRATIO'],
            },
            # Transparency and Accountability - SASB
            {
                'name': 'Transparency and Accountability',
                'description': 'Indicators Used: ANALYTICNONAUDITAUDITFEESRATIO, AUDITCOMMNONEXECMEMBERS, COMPCOMMNONEXECMEMBERS. '
                            'Expands transparency assessment to include the composition of audit and compensation committees in addition to the audit fee ratio. '
                            'Formula: Transparency and Accountability for SASB = (1 - ANALYTICNONAUDITAUDITFEESRATIO + AUDITCOMMNONEXECMEMBERS + COMPCOMMNONEXECMEMBERS) / 3.',
                'frameworks': 'SASB',
                'indicators': ['ANALYTICNONAUDITAUDITFEESRATIO', 'AUDITCOMMNONEXECMEMBERS', 'COMPCOMMNONEXECMEMBERS'],
            },
        ]


        metrics_data_with_pillars = [
            (e_metrics_data, 'E'),  # Environmental
            (s_metrics_data, 'S'),  # Social
            (g_metrics_data, 'G'),  # Governance
        ]


        for metrics_data, data_pillar in metrics_data_with_pillars:
            for metric_data in metrics_data:
                metric, _ = Metric.objects.get_or_create(
                    pillar=data_pillar,
                    name=metric_data['name'],
                    defaults={'description': metric_data['description']}
                )

                framework_name = metric_data['frameworks']  # 'frameworks' is a string now, not a list
                framework, _ = Framework.objects.get_or_create(name=framework_name)
                FrameworkMetric.objects.get_or_create(framework=framework, metric=metric, defaults={'predefined_weight': 1})

                for indicator_name in metric_data['indicators']:
                    indicators = Indicator.objects.filter(name=indicator_name)
                    if indicators:
                        for indicator in indicators:
                            MetricIndicator.objects.get_or_create(metric=metric, indicator=indicator, defaults={'predefined_weight': 1})
                    else:
                        raise ValueError(f"Indicator with name '{indicator_name}' does not exist.")

        self.stdout.write(self.style.SUCCESS('Successfully populated metrics and related data.'))
