from django.urls import path
from .views import *
urlpatterns = [
    path('auth/',firebase_auth),
    path('get_email',protected_view),
]
