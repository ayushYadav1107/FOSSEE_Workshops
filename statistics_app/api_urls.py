from django.urls import re_path as url
from statistics_app import api_views

urlpatterns = [
    url(r'^public/$', api_views.api_public_stats, name='public_stats'),
    url(r'^team/$', api_views.api_team_stats, name='team_stats'),
    url(r'^team/(?P<team_id>\d+)/$', api_views.api_team_stats, name='team_stats_id'),
]
