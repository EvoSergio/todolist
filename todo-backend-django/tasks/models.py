from django.contrib.auth.models import User
from django.db import models

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default='Incomplete')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title