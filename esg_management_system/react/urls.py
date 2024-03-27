from django.urls import path, re_path

from . import views

urlpatterns = [
    path("", views.IndexView.as_view(template_name="build/index.html"), name='index'),
    re_path(r'^.*$', views.IndexView.as_view(template_name="build/index.html"), name='index')
]
