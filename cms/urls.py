from django.urls import re_path as url

from cms import views

app_name = "cms"

urlpatterns = [
    url('^$', views.home, name='home'),
    url('^(?P<permalink>.+)$', views.home, name='home')
]