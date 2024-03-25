from django.urls import path, re_path
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    path("", views.IndexView.as_view(template_name="build/index.html"), name='index'),
    path("test", views.test, name='test'),
    re_path(r'^.*$', views.IndexView.as_view(template_name="build/index.html"), name='index')
]
