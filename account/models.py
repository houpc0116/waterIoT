from django.db import models

# Create your models here.
class Account(models.Model):
      account = models.CharField(max_length=100)
      pwd = models.CharField(max_length=100)

      class Meta:
        managed = False
        db_table = 'account'
