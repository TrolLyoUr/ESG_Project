from rest_framework import serializers
from django.contrib.auth.models import User
from esg_app.models import Company, Framework, Indicator, Location, Metric, DataValue, FrameworkMetric, MetricIndicator, \
    UserMetricPreference, UserIndicatorPreference
from rest_framework.fields import CharField, IntegerField, FloatField
from django.db.models import ObjectDoesNotExist

'''
Users
•	Utilizes Django's built-in User model which includes the following attributes:
•	id (Auto-generated primary key by Django)
•	username (Unique, provided by Django's User model)
•	password (Securely hashed, provided by Django's User model)
•	email (Provided by Django's User model)
•	first_name (Provided by Django's User model)
•	last_name (Provided by Django's User model)
Locations
•	location_id (Primary Key, auto-increment)
•	name (Name of the location, such as city or country)
Companies
•	company_id (Primary Key, auto-increment)
•	name (Name of the company, unique)
•	description (Description of the company)
•	location (Foreign Key, references Locations.location_id)
Frameworks
•	framework_id (Primary Key, auto-increment)
•	name (Name of the framework, unique)
•	description (Description of the framework)

Metrics
•	metric_id (Primary Key, auto-increment)
•	name (Name of the metric)
•	description (Description of the metric)
•	pillar (E, S or G)
Indicators
•	indicator_id (Primary Key, auto-increment)
•	name (Name of the indicator)
•	description (Description of the indicator)
•	source (Source of the indicator)
•	unit (Unit of the indicator)
Data_Values
•	value_id (Primary Key, auto-increment)
•	company (Foreign Key, references Companies.company_id)
•	indicator (Foreign Key, references Indicators.indicator_id)
•	year (Year of the data value)
•	value (Value of the indicator for the company in a given year)
Framework Metrics (Association Table)
•	framework (Foreign Key, references Frameworks.framework_id)
•	metric (Foreign Key, references Metrics.metric_id)
•	predefined_weight (Weight of the metric within the framework)
Metric Indicators (Association Table)
•	metric (Foreign Key, references Metrics.metric_id)
•	indicator (Foreign Key, references Indicators.indicator_id)
•	predefined_weight (Weight of the indicator within the metric)
User Metric Preferences (Association Table )
•	preference_id (Primary Key, auto-increment)
•	user (Foreign Key, references Users.id)
•	framework (Foreign Key, references Frameworks.framework_id)
•	metric (Foreign Key, references Metrics.metric_id)
•	custom_weight (Custom weight given by the user to the metric)
User Indicator Preferences (Association Table)
•	preference_id (Primary Key, auto-increment)
•	user (Foreign Key, references Users.id)
•	metric (Foreign Key, references Metrics.metric_id)
•	indicator (Foreign Key, references Indicators.indicator_id)
•	custom_weight (Custom weight given by the user to the indicator)
'''


class FrameworkMetrics(serializers.ModelSerializer):
    class Meta:
        # model = FrameworkMetric
        fields = ["predefined_weight", "framework", "metric"]
        depth = 1


class FastCompanies(serializers.Serializer):
    id = IntegerField(read_only=True)
    name = CharField(read_only=True)
    location_id = IntegerField(read_only=True)
    location = CharField(read_only=True)


# serialize上面所有的model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'location']
        depth = 1


class FrameworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Framework
        fields = ['id', 'name', 'description']

class DataValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataValue
        fields = ['value_id', 'company', 'indicator', 'year', 'value']

class YearSerializer(serializers.Serializer):
    year = serializers.IntegerField()


# Serializer for List Framework Metrics API
class FrameworkListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Framework
        fields = ['id', 'name', 'description']

    # Include a method field to get the associated metrics with predefined weights
    metrics = serializers.SerializerMethodField()

    def get_metrics(self, framework):
        # Get all associated FrameworkMetric objects
        framework_metrics = FrameworkMetric.objects.filter(framework=framework)
        # Serialize the FrameworkMetric objects
        return FrameworkMetricSerializer(framework_metrics, many=True).data


class MetricSerializer(serializers.ModelSerializer):
    metric_indicators = serializers.SerializerMethodField()

    class Meta:
        model = Metric
        fields = ['id', 'name', 'pillar', 'metric_indicators']

    def get_metric_indicators(self, metric):
        # Get all associated MetricIndicator objects for the metric
        metric_indicators = MetricIndicator.objects.filter(metric=metric)
        # Serialize the MetricIndicator objects including the nested Indicator details
        return MetricIndicatorSerializer(metric_indicators, many=True).data


class FrameworkMetricSerializer(serializers.ModelSerializer):
    metric = MetricSerializer(read_only=True)

    class Meta:
        model = FrameworkMetric
        fields = ['metric', 'predefined_weight']


class IndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = ['id', 'name']


class MetricIndicatorSerializer(serializers.ModelSerializer):
    indicator = IndicatorSerializer()

    class Meta:
        model = MetricIndicator
        fields = ['indicator', 'predefined_weight']


class UserMetricPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMetricPreference
        fields = ['user', 'framework', 'metric', 'custom_weight']

    def create(self, validated_data):
        data = validated_data.initial_data
        user = User.objects.get(id=data['user'])
        framework = Framework.objects.get(id=data['framework'])
        metric = Metric.objects.get(id=data['metric'])
        try:
            oldData = UserMetricPreference.objects.filter(user=user, framework=framework, metric=metric).all()
            oldData.delete()
            newdata = UserMetricPreference(user=user, framework=framework, metric=metric,
                                           custom_weight=data['custom_weight'])
        except ObjectDoesNotExist:
            newdata = UserMetricPreference(user=user, framework=framework, metric=metric,
                                           custom_weight=data['custom_weight'])
        newdata.save()
        return newdata


class UserIndicatorPreferenceSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        preferences = []
        for data in validated_data:
            user = User.objects.get(id=data['user'])
            metric = Metric.objects.get(id=data['metric'])
            indicator = Indicator.objects.get(id=data['indicator'])
            obj, created = UserIndicatorPreference.objects.update_or_create(
                user=user,
                metric=metric,
                indicator=indicator,
                defaults={'custom_weight': data['custom_weight']}
            )
            preferences.append(obj)
        return preferences

class UserIndicatorPreferenceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserIndicatorPreference
        fields = ['user', 'metric', 'indicator', 'custom_weight']
        list_serializer_class = UserIndicatorPreferenceSerializer


class MetricsScoresSerializer(serializers.Serializer):
    metric_id: IntegerField(read_only=True) # type: ignore
    metric_name = CharField(read_only=True)
    score = FloatField(read_only=True)


class MetricsDataSerializer(serializers.Serializer):
    company_id = IntegerField(read_only=True)
    company_name = CharField(read_only=True)
    metrics_scores = MetricsScoresSerializer(read_only=True)


class IndicatorInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = ('description', 'unit', 'source')

class MetricInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = ('description',)