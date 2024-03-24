import csv
import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from esg_app.models import Company, Indicator, DataValue, Location

# Setup logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Import ESG data from a CSV file using bulk operations'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The CSV file path')
        parser.add_argument('--dry-run', action='store_true', help='Run the command without saving to the database')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        dry_run = options['dry_run']

        with transaction.atomic():
            if dry_run:
                self.stdout.write(self.style.WARNING("Dry run mode enabled. No changes will be saved."))
                transaction.set_rollback(True)
            self.import_esg_data(csv_file)

    def import_esg_data(self, csv_file):
        # Preload existing records for efficiency
        existing_locations = {loc.name: loc for loc in Location.objects.all()}
        existing_companies = {comp.name: comp for comp in Company.objects.select_related('location').all()}
        existing_indicators = {ind.name: ind for ind in Indicator.objects.all()}

        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            locations_to_create, companies_to_create, indicators_to_create, data_values_to_create = [], [], [], []

            for row in reader:
                try:
                    location_name, company_name, indicator_name, data_value, data_year = self.extract_data(row)

                    # Efficiently handle location creation
                    location = existing_locations.get(location_name)
                    if not location:
                        location = Location(name=location_name)
                        existing_locations[location.name] = location
                        locations_to_create.append(location)

                    # Efficiently handle company creation
                    company = existing_companies.get(company_name)
                    if not company:
                        company = Company(name=company_name, location=location)
                        existing_companies[company.name] = company
                        companies_to_create.append(company)

                    # Efficiently handle indicator creation
                    indicator = existing_indicators.get(indicator_name)
                    if not indicator:
                        indicator = Indicator(name=indicator_name, source=row['provider_name'], description=row['metric_description'], unit=row['metric_unit'])
                        existing_indicators[indicator.name] = indicator
                        indicators_to_create.append(indicator)

                    # Prepare DataValue
                    data_value_obj = DataValue(company=company, indicator=indicator, year=data_year, value=data_value)
                    data_values_to_create.append(data_value_obj)

                except Exception as e:
                    logger.error(f'Error processing row {row}: {e}', exc_info=True)

            # Bulk create records
            Location.objects.bulk_create(locations_to_create, ignore_conflicts=True)
            # After creating locations, reload them to ensure we have all, including newly created ones
            existing_locations = {loc.name: loc for loc in Location.objects.all()}

            # Update Company instances with saved Location instances to ensure foreign key integrity
            for company in companies_to_create:
                # Ensure the company's location is a saved instance
                company.location = existing_locations[company.location.name]

            Company.objects.bulk_create(companies_to_create, ignore_conflicts=True)
            company_mapping = {comp.name: comp for comp in Company.objects.select_related('location').all()}

            Indicator.objects.bulk_create(indicators_to_create, ignore_conflicts=True)
            # Fetch and map all indicators, assuming 'name' can uniquely identify them
            indicator_mapping = {ind.name: ind for ind in Indicator.objects.all()}

            
            # Ensure DataValue related objects are set with saved instances
            for data_value in data_values_to_create:
                data_value.company = company_mapping[data_value.company.name]
                data_value.indicator = indicator_mapping[data_value.indicator.name]
                
            DataValue.objects.bulk_create(data_values_to_create, ignore_conflicts=True)

            self.stdout.write(self.style.SUCCESS("Data import complete!"))

    def extract_data(self, row):
        return row['headquarter_country'], row['company_name'], row['metric_name'], row['metric_value'], int(row['metric_year'].split('-')[0])
