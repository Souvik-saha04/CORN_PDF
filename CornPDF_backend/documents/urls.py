from django.urls import path
from .views import *

urlpatterns = [
    path("create/", create_document),
    path("", list_documents),
    path("<int:doc_id>/", retrieve_document),
    path("<int:doc_id>/delete/", delete_document),
]