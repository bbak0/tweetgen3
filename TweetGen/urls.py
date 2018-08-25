from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from django.conf.urls import url, include
from rest_framework import routers

#rest api routers




urlpatterns = [
    path('', views.index, name='index'),
    url(r'^ajax/get_tweet/$', views.get_tweet, name='generate tweet'),
    url(r'^login/$', auth_views.login, name='login'),
    url(r'^logout/$', auth_views.logout, name='logout'),
    url(r'^oauth/', include('social_django.urls', namespace='social')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
