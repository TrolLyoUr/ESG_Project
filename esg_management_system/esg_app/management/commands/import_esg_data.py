import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from esg_app.models import Company, Indicator, DataValue, Location

class Command(BaseCommand):
    help = 'Import ESG data from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        self.import_esg_data(csv_file)

    def import_esg_data(self, csv_file):
        with open(csv_file, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Extract data from the row
                company_name = row['company_name']
                indicator_name = row['metric_name']
                indicator_description = row['metric_description']
                indicator_unit = row['metric_unit']
                indicator_source = row['provider_name']
                data_value = row['metric_value']
                data_year_str = row['metric_year'] # Assuming the date format is comvert from 'mm/dd/yyyy' to 'YYYY-MM-DD'
                data_year = int(data_year_str.split('-')[0])  # Extract the year part

                # Get or create Company
                location, _ = Location.objects.get_or_create(name=row['headquarter_country'])
                company, _ = Company.objects.get_or_create(name=company_name, location=location)

                # Get or create Indicator
                indicator, _ = Indicator.objects.get_or_create(
                    name=indicator_name,
                    description=indicator_description,
                    unit=indicator_unit,
                    source=indicator_source
                )

                # Create DataValue
                data_value = DataValue.objects.create(
                    company=company,
                    indicator=indicator,
                    year=data_year,
                    value=data_value
                )

                self.stdout.write(self.style.SUCCESS(f'Imported data for {company_name} - {indicator_name}'))