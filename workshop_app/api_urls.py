from django.urls import re_path as url
from workshop_app import api_views

app_name = "workshop_app_api"

urlpatterns = [
    # Auth
    url(r'^auth/csrf/$', api_views.api_csrf),
    url(r'^auth/user/$', api_views.api_current_user),
    url(r'^auth/login/$', api_views.api_login),
    url(r'^auth/logout/$', api_views.api_logout),
    url(r'^auth/activate/(?P<key>.+)$', api_views.api_activate),

    # Registration & choices
    url(r'^register/$', api_views.api_register),
    url(r'^choices/$', api_views.api_form_choices),

    # Workshop Types — must come before generic workshops/<id>/
    url(r'^workshops/types/$', api_views.api_workshop_types),
    url(r'^workshops/types/(?P<workshop_type_id>\d+)/tnc/$', api_views.api_workshop_type_tnc),
    url(r'^workshops/types/(?P<workshop_type_id>\d+)/$', api_views.api_workshop_type_detail),

    # Workshop actions — must come before generic workshops/<id>/
    url(r'^workshops/status/$', api_views.api_workshop_status),
    url(r'^workshops/propose/$', api_views.api_propose_workshop),
    url(r'^workshops/accept/(?P<workshop_id>\d+)/$', api_views.api_accept_workshop),
    url(r'^workshops/change-date/(?P<workshop_id>\d+)/$', api_views.api_change_workshop_date),

    # Generic workshop detail (last)
    url(r'^workshops/(?P<workshop_id>\d+)/$', api_views.api_workshop_detail),

    # Profile
    url(r'^profile/update/$', api_views.api_update_profile),
    url(r'^profile/(?P<user_id>\d+)/$', api_views.api_coordinator_profile),
    url(r'^profile/$', api_views.api_own_profile),
]

