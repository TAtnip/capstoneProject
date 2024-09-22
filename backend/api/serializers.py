from rest_framework import serializers
from django.contrib.auth.models import User 
from .models import MuscleGroup, Set, Exercise, Mesocycle, Session, PerformanceMetric
## Serializer which takes model and converts to JSON data

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ["id", "username", "password"]

    # This will make sure nobody can read what the password is.
    extra_kwargs = {"password": {"write_only":True}}

  def create(self, validated_data):
    print(validated_data)

    ## The create_user method capitalizes on the set_password() method. it hashes the password for you!
    user = User.objects.create_user(**validated_data)
    return user

class MuscleGroupSerializer(serializers.ModelSerializer):
  class Meta:
    model = MuscleGroup
    fields = ["id","name"]

class ExerciseSerializer(serializers.ModelSerializer):
  muscle_groups = MuscleGroupSerializer(many=True, read_only=True)
  class Meta:
    model = Exercise
    fields = ["id","name","description", "muscle_groups"]
  
class MesocycleSerializer(serializers.ModelSerializer):
  class Meta:
    model = Mesocycle
    fields = ["id","name","user","start_date","end_date","description"]
    extra_kwargs = {"user":{"read_only":True}}

class SessionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Session
    fields = ["id","name", "mesocycle","user","date","notes"]
    extra_kwargs = {"user":{"read_only":True}}

class SetSerializer(serializers.ModelSerializer):
  class Meta:
    model = Set
    fields = ["id","session","exercise","weight","reps","sequence","rir","sequence"]


class PerformanceMetricSerializer(serializers.ModelSerializer):
  class Meta:
    model = PerformanceMetric
    fields = ["id","user","exercise","one_rep_max","date_predicted"]
    extra_kwargs = {"user":{"read_only":True}}


