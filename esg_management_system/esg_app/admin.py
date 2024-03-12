from django.contrib import admin
from .models import Location, Company, Framework, Metric, Indicator, DataValue, FrameworkMetric, MetricIndicator, UserMetricPreference, UserIndicatorPreference

# Optional: Define custom admin classes to customize the admin interface
# class CompanyAdmin(admin.ModelAdmin):
#     list_display = ('name', 'description', 'location')

# class FrameworkAdmin(admin.ModelAdmin):
#     list_display = ('name', 'description')

# class MetricAdmin(admin.ModelAdmin):
#     list_display = ('name', 'description', 'pillar', 'framework')

# class IndicatorAdmin(admin.ModelAdmin):
#     list_display = ('name', 'description', 'source')

# class DataValueAdmin(admin.ModelAdmin):
#     list_display = ('company', 'indicator', 'year', 'value')

class FrameworkMetricAdmin(admin.ModelAdmin):
    list_display = ('framework', 'metric', 'predefined_weight')

class MetricIndicatorAdmin(admin.ModelAdmin):
    list_display = ('metric', 'indicator', 'predefined_weight')

class UserMetricPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'framework', 'metric', 'custom_weight')

class UserIndicatorPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'metric', 'indicator', 'custom_weight')

# Register your models here
# admin.site.register(Location)
# admin.site.register(Company, CompanyAdmin)
# admin.site.register(Framework, FrameworkAdmin)
# admin.site.register(Metric, MetricAdmin)
# admin.site.register(Indicator, IndicatorAdmin)
# admin.site.register(DataValue, DataValueAdmin)
admin.site.register(FrameworkMetric, FrameworkMetricAdmin)
admin.site.register(MetricIndicator, MetricIndicatorAdmin)
admin.site.register(UserMetricPreference, UserMetricPreferenceAdmin)
admin.site.register(UserIndicatorPreference, UserIndicatorPreferenceAdmin)
