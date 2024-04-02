# esg_app/forms.py

from django import forms

class CalculationForm(forms.Form):
    metrics = forms.JSONField()

    def calculate(self):
        metrics = self.cleaned_data.get('metrics')
        new_sum = 0
        
        for metric in metrics:
            metric_id = metric.get('metric_id')
            custom_weight = metric.get('custom_weight')

            metric_value = get_metric_value(metric_id)
            new_sum += metric_value * custom_weight

        return new_sum


class CustomWeightSaveForm(forms.Form):
    pass