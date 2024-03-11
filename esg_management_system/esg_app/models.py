from django.db import models
from django.contrib.auth.models import User

class Industry(models.Model):
    industry_name = models.CharField(max_length=255)
    industry_code = models.CharField(max_length=50)

class Company(models.Model):
    name = models.CharField(max_length=255)
    industry = models.ForeignKey(Industry, on_delete=models.CASCADE)
    # Optionally link to a user if needed
    # user = models.ForeignKey(User, on_delete=models.CASCADE)

class ESGFramework(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    # Link frameworks to users if there's a need for subscription or assignment
    users = models.ManyToManyField(User, related_name='frameworks')

class ESGMetric(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    framework = models.ForeignKey(ESGFramework, related_name='metrics', on_delete=models.CASCADE)
    unit = models.CharField(max_length=50)  # To accommodate various units from the data
    data_type = models.CharField(max_length=50)  # To handle different data types (e.g., float, int, ratio)

class CompanyESGData(models.Model):
    company = models.ForeignKey(Company, related_name='esg_data', on_delete=models.CASCADE)
    metric = models.ForeignKey(ESGMetric, related_name='company_data', on_delete=models.CASCADE)
    value = models.TextField()  # Using Text to accommodate various formats like ratios, percentages, etc.
    year = models.IntegerField()
    # Additional field to store the reporting period if data varies within a year
    period = models.CharField(max_length=50, null=True, blank=True)
