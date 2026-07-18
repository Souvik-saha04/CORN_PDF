from django.urls import path
from .views import *
from .quiz.views import generate_quiz
urlpatterns=[
    path('ask_question/',ask_question),
    path("generate/",generate_quiz,name="generate_quiz"),
]