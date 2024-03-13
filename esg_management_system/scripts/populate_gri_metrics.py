from esg_app.models import Framework, Metric

def run():
    # Create the GRI Framework if it doesn't exist
    framework, created = Framework.objects.get_or_create(
        name='GRI',
        description='The GRI is an international independent organization that helps businesses, governments, and other organizations understand and communicate their sustainability impacts. The GRI Standards are the most widely used standards for sustainability reporting, offering a comprehensive framework for reporting on economic, environmental, and social impacts.'
    )

    # Define the GRI 303 metrics
    gri_303_metrics = [
        {
            'name': 'GRI 303-1',
            'description': 'Interactions with Water: This disclosure requires a qualitative narrative on how the organization interacts with water, including the sources used, related impacts, and any water-related ecosystems significantly affected by the organization\'s withdrawals or discharges.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 303-2',
            'description': 'Management of Water Discharge-Related Impacts: Organizations are expected to discuss their approach to managing and mitigating impacts related to water discharge, including the quality and destination of the discharge.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 303-3',
            'description': 'Water Withdrawal: This metric involves reporting the total volume of water withdrawn, by source (e.g., surface water, groundwater, rainwater, and municipal water supplies). It provides insight into the organization\'s dependence on various water sources and potential impacts on local water resources.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 303-4',
            'description': 'Water Discharge: Organizations report the total volume of water discharged, by quality and destination. This includes details about the treatment of the water before discharge and the receiving body of water, helping stakeholders understand the potential impact on local water ecosystems.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 303-5',
            'description': 'Water Consumption: This metric requires reporting the total water consumed, defined as the amount of water withdrawn minus water returned to the original source or other sources. It helps assess the organization\'s impact on water availability.',
            'pillar': 'E'
        }
    ]

    # Define the GRI 305 metrics
    gri_305_metrics = [
        {
            'name': 'GRI 305-1',
            'description': 'Direct (Scope 1) GHG Emissions: This metric involves reporting the total direct greenhouse gas (GHG) emissions from operations that are owned or controlled by the organization. These are emissions from sources that are directly owned or controlled, such as emissions from combustion in owned or controlled boilers, furnaces, vehicles, etc.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 305-2',
            'description': 'Energy Indirect (Scope 2) GHG Emissions: This involves reporting the total indirect GHG emissions from the consumption of purchased or acquired electricity, heating, cooling, and steam used by the organization. Scope 2 accounts for emissions that are a consequence of the organization\'s energy use but occur at sources owned or controlled by another entity.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 305-3',
            'description': 'Other Indirect (Scope 3) GHG Emissions: This metric includes reporting on GHG emissions that are a consequence of the organization\'s activities but occur from sources not owned or controlled by the organization. Examples might include emissions related to business travel, procurement, waste disposal, and the use of sold products.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 305-4',
            'description': 'GHG Emissions Intensity: Organizations are required to report the greenhouse gas emissions intensity ratio, which provides insight into the emissions efficiency of an organization\'s operations. This can be calculated in several ways, such as per unit of production, per unit of revenue, or another relevant metric.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 305-5',
            'description': 'Reduction of GHG Emissions: This metric involves reporting on the reductions achieved in GHG emissions as a result of initiatives to reduce emissions over the reporting period. It encompasses reductions from both direct and indirect emissions sources.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 305-6',
            'description': 'Emissions of Ozone-Depleting Substances (ODS): Organizations report the total weight of ozone-depleting substances emitted, by type of substance, providing insight into the organization\'s impact on stratospheric ozone depletion.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 305-7',
            'description': 'Nitrogen Oxides (NOx), Sulfur Oxides (SOx), and Other Significant Air Emissions: This metric involves reporting emissions of significant air pollutants, including nitrogen oxides, sulfur oxides, and other pollutants such as volatile organic compounds (VOCs) and particulate matter. Organizations are expected to report the types, weight, and sources of these emissions.',
            'pillar': 'E'
        }
    ]

    gri_306_metrics = [
        {
            'name': 'GRI 306-1',
            'description': 'Waste Generation and Significant Waste-Related Impacts: Organizations are required to provide a narrative on their waste generation and significant waste-related impacts, including a description of the types and sources of waste, waste management methods, and the impacts of waste on communities and the environment.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 306-2',
            'description': 'Management of Significant Waste-Related Impacts: This disclosure involves discussing the organization\'s approach to managing significant waste-related impacts, including efforts to prevent, recycle, reuse, recover, and dispose of waste.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 306-3',
            'description': 'Waste Generated: Organizations report the total amount of waste generated, by type and disposal method. This includes specifying the amounts of hazardous and non-hazardous waste, as well as the disposal methods used (e.g., recycling, incineration, landfill).',
            'pillar': 'E'
        },
        {
            'name': 'GRI 306-4',
            'description': 'Waste Diverted from Disposal: This metric involves reporting the total amount and percentage of waste diverted from disposal through reuse, recycling, composting, or other means, helping to understand the organization\'s effectiveness in waste reduction efforts.',
            'pillar': 'E'
        },
        {
            'name': 'GRI 306-5',
            'description': 'Waste Directed to Disposal: Organizations are expected to report the total amount and percentage of waste that is directed to disposal, specifying the methods used (e.g., landfill, incineration without energy recovery). This helps stakeholders assess the potential environmental impact of the organization\'s waste disposal practices.',
            'pillar': 'E'
        }
    ]

    gri_403_metrics = [
        {
            'name': 'GRI 403-1',
            'description': 'Occupational Health and Safety Management System: This metric involves reporting on the organization\'s occupational health and safety (OHS) management system, including its scope, key components, and how it is integrated into business processes.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-2',
            'description': 'Hazard Identification, Risk Assessment, and Incident Investigation: Organizations report on their processes for hazard identification, risk assessment, and incident investigation, including the involvement of workers in these processes.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-3',
            'description': 'Occupational Health Services: This metric requires reporting on the organization\'s occupational health services, including the services provided to workers and their access to these services.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-4',
            'description': 'Worker Participation, Consultation, and Communication on Occupational Health and Safety: Organizations are expected to report on the mechanisms for worker participation, consultation, and communication on occupational health and safety, and how workers are protected from reprisals.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-5',
            'description': 'Worker Training on Occupational Health and Safety: This involves reporting on the training provided to workers on occupational health and safety, including the scope of the training and the number of training hours.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-6',
            'description': 'Promotion of Worker Health: Organizations report on their programs for promoting worker health, including the scope of the programs and any specific health outcomes aimed at.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-7',
            'description': 'Prevention and Mitigation of Occupational Health and Safety Impacts Directly Linked by Business Relationships: This metric requires reporting on how the organization prevents and mitigates the impacts of occupational health and safety risks in its supply chain and business relationships.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-8',
            'description': 'Workers Covered by an Occupational Health and Safety Management System: Organizations report the number of workers covered by an OHS management system, broken down by region and gender.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-9',
            'description': 'Work-Related Injuries: This involves reporting on work-related injuries, including the types of injury, rates, and number of work-related fatalities, broken down by region and gender.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 403-10',
            'description': 'Work-Related Ill Health: Organizations report on work-related ill health, including the types of ill health, rates, and number of cases, broken down by region and gender.',
            'pillar': 'S'
        }
    ]

    gri_404_metrics = [
        {
            'name': 'GRI 404-1',
            'description': 'Average Hours of Training per Year per Employee: This metric involves reporting the average hours of training that employees receive per year, broken down by gender and employee category.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 404-2',
            'description': 'Programs for Upgrading Employee Skills and Transition Assistance Programs: Organizations report on programs for upgrading employee skills and effective transition assistance programs, including the number of employees benefiting from such programs.',
            'pillar': 'S'
        },
        {
            'name': 'GRI 404-3',
            'description': 'Percentage of Employees Receiving Regular Performance and Career Development: This metric requires reporting the percentage of employees receiving regular performance and career development reviews, broken down by gender and employee category.',
            'pillar': 'S'
        }
    ]

    gri_203_metrics = [
    {
        'name': 'GRI 203-1',
        'description': 'Infrastructure Investments and Services Supported: This metric involves reporting on the extent of development and impact of infrastructure investments and services supported, including the nature and scope of these investments and services. Organizations should highlight the primary beneficiaries, which can range from local communities to broader regions, and the expected impacts of these initiatives.',
        'pillar': 'S'
    },
    {
        'name': 'GRI 203-2',
        'description': 'Significant Indirect Economic Impacts: Organizations are expected to report on the significant indirect economic impacts, including the extent of impacts.',
        'pillar': 'S'
    }
    ]

    gri_102_metrics = [
        {
            'name': 'GRI 102-35',
            'description': 'Remuneration Policies: This disclosure involves reporting on the organization\'s remuneration policies for the highest governance body and senior executives. It encompasses the remuneration policy process, how it supports the organization\'s mission and values, and how it links to the organization\'s performance criteria, including sustainability performance. Although it does not directly ask for compensation figures, understanding the policies behind remuneration can provide context for the compensation data you have.',
            'pillar': 'G'
        },
        {
            'name': 'GRI 102-38',
            'description': 'Annual Total Compensation Ratio: This metric requires reporting the ratio of the annual total compensation for the organization\'s highest-paid individual in each country of significant operations to the median annual total compensation for all employees (excluding the highest-paid individual) in the same country. This metric provides insight into the equity of pay scales within the organization and is directly relevant to the data you have regarding the total annual compensation for the highest-paid individual and the median annual compensation for the company.',
            'pillar': 'G'
        }
    ]

    gri_metrics = gri_303_metrics + gri_305_metrics + gri_306_metrics + gri_403_metrics + gri_404_metrics + gri_203_metrics + gri_102_metrics

    # Create the metrics in the database
    for metric_data in gri_metrics:
        metric, created = Metric.objects.get_or_create(
            name=metric_data['name'],
            description=metric_data['description'],
            pillar=metric_data['pillar'],
            framework=framework
        )
        if created:
            print(f'Created metric: {metric.name}')
        else:
            print(f'Metric already exists: {metric.name}')