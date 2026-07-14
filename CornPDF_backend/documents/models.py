from django.db import models
from django.conf import settings

class Docs(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    file_url = models.URLField()
    public_id = models.CharField(max_length=255)

    status = models.CharField(
        max_length=20,
        choices=[
            ("UPLOADED", "uploaded"),
            ("PROCESSING", "processing"),
            ("PROCESSED", "processed"),
            ("FAILED", "failed"),
        ],
        default="UPLOADED"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name