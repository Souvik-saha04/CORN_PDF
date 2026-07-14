from django.urls import path
from .views import *
urlpatterns=[
    path('process_document/',process_document),
    path('ask_question/',ask_question),
    
]