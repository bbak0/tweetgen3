from django.db import models
from django.contrib.postgres.fields import JSONField

# Create your models here.

class Chain(models.Model):
    screen_name = models.CharField(max_length = 20, primary_key="True")
    latest_tweet_id = models.BigIntegerField()
    chain = JSONField()
    last_updated = models.DateTimeField(auto_now=True)

class UseCount(models.Model):
    screen_name = models.CharField(max_length = 20, primary_key="True")
    counter = models.IntegerField(default = 0)
