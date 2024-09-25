from django.db import models
from django.contrib.auth.models import User 
# imports djangos built-in user model with id, username, email, password, and other_profile_fields
# Create your models here.

class MuscleGroup(models.Model):
  name = models.CharField(max_length=50)

  # this function will allow you to print an instance of an object of this class type, and it will instead return a human readable format of the object
  def __str__self(self):
    return self.name 

class Exercise(models.Model):
  name = models.CharField(max_length=50)
  muscle_groups = models.ManyToManyField(MuscleGroup, blank=True)
  description = models.TextField(blank=True)

  def __str__self(self):
    return self.name
  
class Mesocycle(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  name = models.CharField(max_length=50)
  start_date = models.DateField()
  end_date = models.DateField()
  description = models.TextField(blank=True)

  def __str__self(self):
    return "{self.name} ({self.user.username})"
  
class Session(models.Model):
  mesocycle = models.ForeignKey(Mesocycle, on_delete = models.SET_NULL, null = True, blank = True)
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  date = models.DateField()
  notes = models.TextField(blank=True)

  def __str__self(self):
    return "{self.name} - ({self.date})"
  
class Set(models.Model):
  session = models.ForeignKey(Session, on_delete=models.CASCADE, blank = True, null = True)
  exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
  weight = models.PositiveIntegerField()
  reps = models.PositiveIntegerField()
  sequence = models.PositiveIntegerField()
  rir = models.PositiveIntegerField()

  class Meta:
    ordering = ['sequence']

  def __str__self(self):
    return "{self.exercise.name} - set number {self.sequence} - weight {self.weight} - reps {self.reps} - rir {self.rir}"
  
class PerformanceMetric(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
  one_rep_max = models.DecimalField(max_digits = 8, decimal_places = 2, null = True, blank = True)
  date_predicted = models.DateField()
  
  def __str__(self):
          return f"{self.user.username} - {self.exercise.name} - Predicted 1RM {self.one_rep_max}"