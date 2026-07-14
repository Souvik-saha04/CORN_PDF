from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    firebase_uid = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
    )