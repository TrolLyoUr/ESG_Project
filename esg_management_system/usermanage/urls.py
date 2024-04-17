from django.urls import path

from . import views

app_name = "usermanage"
urlpatterns = [
    path("", views.login_view, name="index"),
    path("login", views.login_view, name="login"),
    path("resetpwd", views.resetpwd_view, name="resetpwd"),
    path("sendpwdemail", views.resetpwd_send_view, name="sendpwdemail"),
    path("register", views.register_view, name="register"),
    path("logout", views.userlogout, name='logout')
]
