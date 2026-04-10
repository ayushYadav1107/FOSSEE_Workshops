# Password reset URLs are handled via django.contrib.auth.urls included in workshop_portal/urls.py
# This file is kept for reference only
from django.urls import re_path
from django.contrib.auth import views as auth_views

urlpatterns = [
    re_path(r'^changepassword/$', auth_views.PasswordChangeView.as_view(), name='password_change'),
    re_path(r'^password_change/done/$', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),
]
