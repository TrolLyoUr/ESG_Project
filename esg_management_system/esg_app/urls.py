from django.urls import path, re_path
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    path("", TemplateView.as_view(template_name="build/index.html"), name='index'),
    re_path(r'^.*$', TemplateView.as_view(template_name="build/index.html"), name='index')
]
