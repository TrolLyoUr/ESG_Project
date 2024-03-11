from django.contrib import admin
from .models import Industry, Company, ESGFramework, ESGMetric, CompanyESGPerformance

# Register your models here.
admin.site.register(Industry)
admin.site.register(Company)
admin.site.register(ESGFramework)
admin.site.register(ESGMetric)
admin.site.register(CompanyESGPerformance)
