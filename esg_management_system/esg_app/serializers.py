from rest_framework import serializers, permissions
from django.contrib.auth.models import User
from esg_app.models import Company, Framework, Indicator, Location, Metric, DataValue, FrameworkMetric, MetricIndicator, \
    UserMetricPreference, UserIndicatorPreference

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


# serialize上面所有的model


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'first_name', 'last_name']


class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ['url', 'location_id', 'name']


class CompanySerializer(serializers.HyperlinkedModelSerializer):
    # location = LocationSerializer()
    class Meta:
        model = Company
        fields = ['url', 'id', 'name', 'description', 'location_id']


class FrameworkSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Framework
        fields = ['url', 'framework_id', 'name', 'description']


class MetricSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Metric
        fields = ['url', 'metric_id', 'name', 'description', 'pillar']


class IndicatorSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Indicator
        fields = ['url', 'indicator_id', 'name',
                  'description', 'source', 'unit']


class DataValueSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = DataValue
        fields = ['url', 'value_id', 'company', 'indicator', 'year', 'value']


# 为association table创建serializer
class FrameworkMetricSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FrameworkMetric
        fields = ['url', 'framework', 'metric', 'predefined_weight']


class MetricIndicatorSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MetricIndicator
        fields = ['url', 'metric', 'indicator', 'predefined_weight']


class UserMetricPreferenceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UserMetricPreference
        fields = ['url', 'user', 'framework', 'metric', 'custom_weight']


class UserIndicatorPreferenceSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UserIndicatorPreference
        fields = ['url', 'user', 'metric', 'indicator', 'custom_weight']
