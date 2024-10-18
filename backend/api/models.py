from django.db import models

# Import Djangos built-in user model with id, username, email, password, and other_profile_fields
from django.contrib.auth.models import User 


# Models, Utilized ChatGPT to generate these quickly based on prompt

class MuscleGroup(models.Model):
  name = models.CharField(max_length=50)

  # this function will allow you to print an instance of an object of this class type, and it will instead return a human readable format of the object
  def __str__(self):
    return self.name 

class Exercise(models.Model):
  name = models.CharField(max_length=50)
  muscle_groups = models.ManyToManyField(MuscleGroup, blank=True)
  description = models.TextField(blank=True)

  def __str__(self):
    return self.name
  
class Mesocycle(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  name = models.CharField(max_length=50)
  start_date = models.DateField()
  end_date = models.DateField()
  description = models.TextField(blank=True)

  def __str__(self):
    return "{self.name} ({self.user.username})"
  
class Session(models.Model):
  mesocycle = models.ForeignKey(Mesocycle, on_delete = models.SET_NULL, null = True, blank = True)
  user = models.ForeignKey(User, on_delete=models.CASCADE)
  date = models.DateField()
  notes = models.TextField(blank=True, null=True)

  def __str_(self):
    return "{self.name} - ({self.date})"
  
from django.db.models import Max

class Set(models.Model):
    session = models.ForeignKey(Session, on_delete=models.CASCADE, blank=True, null=True)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    weight = models.PositiveIntegerField(blank=True, null=True)
    reps = models.PositiveIntegerField(blank=True, null=True)
    sequence = models.PositiveIntegerField()
    rir = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        ordering = ['sequence']

    def __str__(self):
        return f"{self.exercise.name} - set number {self.sequence} - weight {self.weight} - reps {self.reps} - rir {self.rir}"

    def save(self, *args, **kwargs):
        # Call the original save method
        super().save(*args, **kwargs)
        
        # This code checks against the current one_rep_max in PerformanceMetric for the exercise performed in the set to set a new one_rep_max as needed
        # Only calculate and update one-rep max if weight and reps are provided
        if self.weight and self.reps is not None:

            # Get sets for this session and exercise
            sets = Set.objects.filter(session=self.session, exercise=self.exercise)

            # Calculate the one_rep_max for each set and find the highest - this is based on a prediction algorithm
            max_one_rep_max = max(
                set_.weight + (0.03333 * set_.weight * (set_.reps + (set_.rir or 0))) for set_ in sets
            )

            # Get or create the performance metric for this session, user, and exercise
            metric, created = PerformanceMetric.objects.get_or_create(
                user=self.session.user,
                exercise=self.exercise,
                session=self.session,
                defaults={'one_rep_max': max_one_rep_max}
            )

            # If the entry already exists, update the one_rep_max if the new value is higher
            if not created:
                metric.one_rep_max = max_one_rep_max
                metric.save()


  
class PerformanceMetric(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    one_rep_max = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.exercise.name} - Session {self.session.id} - Predicted 1RM {self.one_rep_max}"
