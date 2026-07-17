from django.urls import path
from .views import *
urlpatterns=[
    path('ask_question/',ask_question),
]