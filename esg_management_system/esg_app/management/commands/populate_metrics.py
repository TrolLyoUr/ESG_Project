from django.core.management.base import BaseCommand
from esg_app.models import Framework, Metric, Indicator, FrameworkMetric, MetricIndicator

class Command(BaseCommand):
    help = 'Populate the database with predefined metrics and related information.'

    def handle(self, *args, **kwargs):
        # Define your metrics and related data
        e_metrics_data = [
            {
                'name': 'Greenhouse Gas (GHG) Emissions Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ENERGYUSETOTAL\nCalculation: Total Scope 1 and Scope 2 emissions divided by total energy use. This metric measures the GHG emissions per unit of energy consumed, highlighting efficiency and environmental impact.\nFormula: GHG Emissions Intensity = (CO2DIRECTSCOPE1+CO2INDIRECTSCOPE2) / ENERGYUSETOTAL',
                'frameworks': ['GRI', 'SASB', 'TCFD'],
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL'],
            },
            {
                'name': 'Water Efficiency',
                'description': 'Indicators Used: WATERWITHDRAWALTOTAL, ENERGYUSETOTAL\nCalculation: Total water withdrawal divided by total energy use. This metric assesses how efficiently water is used relative to energy consumption, important for industries where water is a critical resource.\nFormula: Water Efficiency = WATERWITHDRAWALTOTAL / ENERGYUSETOTAL',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['WATERWITHDRAWALTOTAL', 'ENERGYUSETOTAL'],
            },
            {
                'name': 'Renewable Energy Utilization',
                'description': 'Indicators Used: RENEWENERGYCONSUMED, ENERGYUSETOTAL\nCalculation: Total renewable energy consumed divided by total energy use. This metric indicates the proportion of energy consumption that is sourced from renewable energy, reflecting a commitment to reducing dependency on fossil fuels.\nFormula: Renewable Energy Utilization = RENEWENERGYCONSUMED / ENERGYUSETOTAL * 100%',
                'frameworks': ['GRI', 'SASB', 'TCFD'],
                'indicators': ['RENEWENERGYCONSUMED', 'ENERGYUSETOTAL'],
            },
            {
                'name': 'Waste Recycling Rate',
                'description': 'Indicators Used: WASTE_RECYCLED, WASTETOTAL\nCalculation: Total recycled waste divided by total waste produced. This metric evaluates the effectiveness of waste management practices in recycling and reducing landfill contribution.\nFormula: Waste Recycling Rate = WASTE_RECYCLED / WASTETOTAL * 100%',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['WASTE_RECYCLED', 'WASTETOTAL'],
            },
            {
                'name': 'Carbon Intensity',
                'description': 'Indicators Used: CO2DIRECTSCOPE1, CO2INDIRECTSCOPE2, ENERGYUSETOTAL\nCalculation: Total Scope 1 and Scope 2 emissions divided by total energy use. This metric assesses the amount of carbon emissions per unit of energy used, providing insight into the carbon footprint and efficiency.\nFormula: Carbon Intensity = (CO2DIRECTSCOPE1 + CO2INDIRECTSCOPE2) / ENERGYUSETOTAL',
                'frameworks': ['GRI', 'SASB', 'TCFD'],
                'indicators': ['CO2DIRECTSCOPE1', 'CO2INDIRECTSCOPE2', 'ENERGYUSETOTAL'],
            },
            {
                'name': 'Air Quality Impact',
                'description': 'Indicators Used: SOXEMISSIONS, NOXEMISSIONS, PARTICULATE_MATTER_EMISSIONS\nCalculation: Aggregate emissions of SOx, NOx, and particulate matter. This metric highlights the impact of the company\'s operations on air quality, important for public health and regulatory compliance.\nFormula: Not applicable for direct calculation, but rather an aggregated reporting of individual emissions.',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['SOXEMISSIONS', 'NOXEMISSIONS', 'PARTICULATE_MATTER_EMISSIONS'],
            },
        ]

        s_metrics_data = [
            {
                'name': 'Gender Pay Equity',
                'description': 'Indicators Used: GENDER_PAY_GAP_PERCENTAGE\nCalculation: The percentage difference in average compensation between women and men across the organization. This metric highlights the commitment to gender equality and fair compensation practices.\nFormula: Gender Pay Equity = GENDER_PAY_GAP_PERCENTAGE',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['GENDER_PAY_GAP_PERCENTAGE'],
            },
            {
                'name': 'Diversity in Leadership',
                'description': 'Indicators Used: WOMENMANAGERS, ANALYTICINDEPBOARD, ANALYTICBOARDFEMALE\nCalculation: Proportion of women in management positions and on the board, reflecting the organization\'s commitment to diversity at leadership levels.\nFormula: Diversity in Leadership = (WOMENMANAGERS + ANALYTICINDEPBOARD + ANALYTICBOARDFEMALE) / 3',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['WOMENMANAGERS', 'ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE'],
            },
            {
                'name': 'Employee Turnover Rate',
                'description': 'Indicators Used: TURNOVEREMPLOYEES\nCalculation: The rate at which employees leave the company, voluntarily or involuntarily, which can indicate the overall workplace satisfaction and stability.\nFormula: Employee Turnover Rate = TURNOVEREMPLOYEES',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['TURNOVEREMPLOYEES'],
            },
            {
                'name': 'Workforce Training Investment',
                'description': 'Indicators Used: AVGTRAININGHOURS\nCalculation: Average hours of training provided per employee per year, demonstrating the company\'s investment in employee development and skill enhancement.\nFormula: Workforce Training Investment = AVGTRAININGHOURS',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['AVGTRAININGHOURS'],
            },
            {
                'name': 'Labor Relations Quality',
                'description': 'Indicators Used: TRADEUNIONREP\nCalculation: Percentage of employees represented by trade unions or covered by collective bargaining agreements, indicating the quality of labor relations and employee representation.\nFormula: Labor Relations Quality = TRADEUNIONREP',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['TRADEUNIONREP'],
            },
            {
                'name': 'Health and Safety Performance',
                'description': 'Indicators Used: TIRTOTAL, LOSTWORKINGDAYS, EMPLOYEEFATALITIES\nCalculation: Combines total injury rate, lost working days, and employee fatalities to assess the overall health and safety performance of the organization.\nFormula: Health and Safety Performance = (TIRTOTAL + (LOSTWORKINGDAYS / 1000) + EMPLOYEEFATALITIES) / 3',
                'frameworks': ['GRI', 'SASB', 'TCFD'],
                'indicators': ['TIRTOTAL', 'LOSTWORKINGDAYS', 'EMPLOYEEFATALITIES'],
            },
            {
                'name': 'Employee Well-being and Engagement',
                'description': 'Indicators Used: COMMMEETINGSATTENDANCEAVG, BOARDMEETINGATTENDANCEAVG\nCalculation: Average attendance rates at committee and board meetings, which can serve as a proxy for employee engagement and commitment to governance.\nFormula: Employee Well-being and Engagement = (COMMMEETINGSATTENDANCEAVG + BOARDMEETINGATTENDANCEAVG) / 2',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['COMMMEETINGSATTENDANCEAVG', 'BOARDMEETINGATTENDANCEAVG'],
            },
            {
                'name': 'Workforce Diversity',
                'description': 'Indicators Used: WOMENEMPLOYEES, ANALYTICBOARDFEMALE\nCalculation: The proportion of women within the total workforce and on the board, reflecting the company\'s commitment to fostering diversity.\nFormula: Workforce Diversity = (WOMENEMPLOYEES + ANALYTICBOARDFEMALE) / 2',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['WOMENEMPLOYEES', 'ANALYTICBOARDFEMALE'],
            },
        ]

        g_metrics_data = [
            {
                'name': 'Board Composition and Diversity',
                'description': 'Indicators Used: ANALYTICINDEPBOARD, ANALYTICBOARDFEMALE, ANALYTICNONEXECBOARD\nCalculation: This metric assesses the diversity and independence of the board by evaluating the percentage of independent members, female members, and non-executive members.\nFormula: Board Composition and Diversity = (ANALYTICINDEPBOARD + ANALYTICBOARDFEMALE + ANALYTICNONEXECBOARD) / 3',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['ANALYTICINDEPBOARD', 'ANALYTICBOARDFEMALE', 'ANALYTICNONEXECBOARD'],
            },
            {
                'name': 'Board Meeting Engagement',
                'description': 'Indicators Used: BOARDMEETINGATTENDANCEAVG, COMMMEETINGSATTENDANCEAVG\nCalculation: The average attendance rates at board and committee meetings, indicating the engagement level of board members with the organization\'s governance and oversight functions.\nFormula: Board Meeting Engagement = (BOARDMEETINGATTENDANCEAVG + COMMMEETINGSATTENDANCEAVG) / 2',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['BOARDMEETINGATTENDANCEAVG', 'COMMMEETINGSATTENDANCEAVG'],
            },
            {
                'name': 'Executive Compensation Alignment',
                'description': 'Indicators Used: CEO_PAY_RATIO_MEDIAN, ANALYTICNONAUDITAUDITFEESRATIO\nCalculation: This metric examines the ratio of CEO compensation to the median employee compensation and the proportion of non-audit to audit fees, assessing the alignment of executive compensation with shareholder and stakeholder interests.\nFormula: Executive Compensation Alignment = (CEO_PAY_RATIO_MEDIAN + (1 - ANALYTICNONAUDITAUDITFEESRATIO)) / 2',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['CEO_PAY_RATIO_MEDIAN', 'ANALYTICNONAUDITAUDITFEESRATIO'],
            },
            {
                'name': 'Committee Independence',
                'description': 'Indicators Used: ANALYTICAUDITCOMMIND, ANALYTICCOMPCOMMIND, ANALYTICNOMINATIONCOMMIND\nCalculation: The percentage of independent members in key committees (audit, compensation, and nomination), reflecting the independence of oversight and decision-making processes.\nFormula: Committee Independence = (ANALYTICAUDITCOMMIND + ANALYTICCOMPCOMMIND + ANALYTICNOMINATIONCOMMIND) / 3',
                'frameworks': ['GRI', 'SASB'],
                'indicators': ['ANALYTICAUDITCOMMIND', 'ANALYTICCOMPCOMMIND', 'ANALYTICNOMINATIONCOMMIND'],
            },
            {
                'name': 'Governance Structure Effectiveness',
                'description': 'Indicators Used: ANALYTICNONEXECBOARD, ANALYTICINDEPBOARD, BOARDMEETINGATTENDANCEAVG\nCalculation: A combination of the percentage of non-executive and independent board members with the average board meeting attendance, indicating the effectiveness and commitment of the governance structure.\nFormula: Governance Structure Effectiveness = (ANALYTICNONEXECBOARD + ANALYTICINDEPBOARD + BOARDMEETINGATTENDANCEAVG / 100) / 3',
                'frameworks': ['GRI', 'SASB', 'TCFD'],
                'indicators': ['ANALYTICNONEXECBOARD', 'ANALYTICINDEPBOARD', 'BOARDMEETINGATTENDANCEAVG'],
            },
            {
                'name': 'Transparency and Accountability',
                'description': 'Indicators Used: ANALYTICNONAUDITAUDITFEESRATIO, AUDITCOMMNONEXECMEMBERS, COMPCOMMNONEXECMEMBERS\nCalculation: Evaluates the company\'s commitment to transparency through the ratio of non-audit to audit fees and the independence of members in key oversight committees.\nFormula: Transparency and Accountability = (1 - ANALYTICNONAUDITAUDITFEESRATIO + AUDITCOMMNONEXECMEMBERS + COMPCOMMNONEXECMEMBERS) / 3',
                'frameworks': ['GRI', 'SASB', 'TCFD'],
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

                for framework_name in metric_data['frameworks']:
                    framework, _ = Framework.objects.get_or_create(name=framework_name)
                    FrameworkMetric.objects.get_or_create(framework=framework, metric=metric, defaults={'predefined_weight': 0.5})

                for indicator_name in metric_data['indicators']:
                    indicators = Indicator.objects.filter(name=indicator_name)
                    if indicators:
                        for indicator in indicators:
                            MetricIndicator.objects.get_or_create(metric=metric, indicator=indicator, defaults={'predefined_weight': 0.5})
                    else:
                        raise ValueError(f"Indicator with name '{indicator_name}' does not exist.")

        self.stdout.write(self.style.SUCCESS('Successfully populated metrics and related data.'))
