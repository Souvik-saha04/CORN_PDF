from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class Chunk(models.Model):
    document = models.ForeignKey(
        'documents.Docs', 
        on_delete=models.CASCADE,
        related_name='chunks'
    )
    
    content = models.TextField()
    
    chunk_index = models.IntegerField()  # order of chunk in document
    
    page_number = models.IntegerField(null=True, blank=True)
    
    metadata = models.JSONField(null=True, blank=True)  
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chunk {self.chunk_index} - Doc {self.document.id}"
    



class QueryHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='queries'
    )
    
    document = models.ForeignKey(
        'documents.Docs',
        on_delete=models.CASCADE,
        related_name='queries'
    )
    
    question = models.TextField()
    
    answer = models.TextField()
    
    retrieved_chunks = models.JSONField(
        null=True,
        blank=True
    ) 
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Query by {self.user} on Doc {self.document.id}"