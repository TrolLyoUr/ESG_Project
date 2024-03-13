from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Location(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='companies', blank=True, null=True)

    def __str__(self):
        return self.name


class Framework(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.name


class Metric(models.Model):
    PILLAR_CHOICES = [
        ('E', 'Environmental'),
        ('S', 'Social'),
        ('G', 'Governance'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    pillar = models.CharField(max_length=1, choices=PILLAR_CHOICES)
    framework = models.ForeignKey(Framework, on_delete=models.CASCADE, related_name='metrics')

    def __str__(self):
        return self.name


class Indicator(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    unit = models.CharField(max_length=255, blank=True)
    source = models.TextField()

    def __str__(self):
        return self.name


class DataValue(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='data_values')
    indicator = models.ForeignKey(Indicator, on_delete=models.CASCADE, related_name='data_values')
    year = models.IntegerField()
    value = models.FloatField()


class FrameworkMetric(models.Model):
    framework = models.ForeignKey(Framework, on_delete=models.CASCADE, related_name='framework_metrics')
    metric = models.ForeignKey(Metric, on_delete=models.CASCADE, related_name='framework_metrics')
    predefined_weight = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])


class MetricIndicator(models.Model):
    metric = models.ForeignKey(Metric, on_delete=models.CASCADE, related_name='metric_indicators')
    indicator = models.ForeignKey(Indicator, on_delete=models.CASCADE, related_name='metric_indicators')
    predefined_weight = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])


class UserMetricPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metric_preferences')
    framework = models.ForeignKey(Framework, on_delete=models.CASCADE)
    metric = models.ForeignKey(Metric, on_delete=models.CASCADE)
    custom_weight = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])


class UserIndicatorPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='indicator_preferences')
    metric = models.ForeignKey(Metric, on_delete=models.CASCADE)
    indicator = models.ForeignKey(Indicator, on_delete=models.CASCADE)
    custom_weight = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
