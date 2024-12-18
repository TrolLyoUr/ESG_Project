# Generated by Django 4.2 on 2024-09-11 09:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("esg_app", "0004_remove_metric_framework"),
    ]

    operations = [
        migrations.AlterField(
            model_name="frameworkmetric",
            name="predefined_weight",
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name="metricindicator",
            name="predefined_weight",
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name="userindicatorpreference",
            name="custom_weight",
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name="usermetricpreference",
            name="custom_weight",
            field=models.FloatField(),
        ),
    ]
