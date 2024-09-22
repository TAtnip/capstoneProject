from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import MuscleGroup, Set, Exercise, Mesocycle, Session, PerformanceMetric
from .serializers import UserSerializer, MuscleGroupSerializer, SetSerializer, ExerciseSerializer, MesocycleSerializer, SessionSerializer, PerformanceMetricSerializer
from django.contrib.auth.models import User

class CreateUserView(generics.CreateAPIView):
  queryset = User.objects.all()
  serializer_class = UserSerializer
  permission_classes = [AllowAny]

class MesocycleDetailUpdate(generics.RetrieveUpdateAPIView):
    queryset = Mesocycle.objects.all()
    serializer_class = MesocycleSerializer
    def get_queryset(self):
      #this will give us the user object that is authenticated, can use this to get the data
      authenticated_user = self.request.user
      return Mesocycle.objects.filter(user = authenticated_user)
  
    def perform_create(self, serializer):
      if serializer.is_valid():
        serializer.save(user=self.request.user)
      else:
        print(serializer.errors)


class MesocycleListCreate(generics.ListCreateAPIView):

  #.objects.all() gives all the data
  serializer_class = MesocycleSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    #this will give us the user object that is authenticated, can use this to get the data
    authenticated_user = self.request.user
    return Mesocycle.objects.filter(user = authenticated_user)

  def perform_create(self, serializer):
    if serializer.is_valid():
      serializer.save(user=self.request.user)
    else:
      print(serializer.errors)


class SessionListCreate(generics.ListCreateAPIView):

  #.objects.all() gives all the data
  serializer_class = SessionSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    #this will give us the user object that is authenticated, can use this to get the data
    authenticated_user = self.request.user
    return Session.objects.filter(user = authenticated_user)

  def perform_create(self, serializer):
    if serializer.is_valid():
      serializer.save(user=self.request.user)
    else:
      print(serializer.errors)

class ExerciseListCreate(generics.ListCreateAPIView):

  #.objects.all() gives all the data
  serializer_class = ExerciseSerializer
  permission_classes = [AllowAny]
  queryset =Exercise.objects.all()

class MuscleGroupListCreate(generics.ListCreateAPIView):

  serializer_class = MuscleGroupSerializer
  permission_classes =[AllowAny]
  queryset = MuscleGroup.objects.all()

class MesocycleDelete(generics.DestroyAPIView):
  serializer_class = MesocycleSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    authenticated_user = self.request.user
    return Mesocycle.objects.filter(user=authenticated_user)
  

  
class MuscleGroupRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):

  #.objects.all() gives all the data
  queryset =MuscleGroup.objects.all()
  serializer_class = MuscleGroupSerializer
  lookup_field = "pk"




# Create your views here.
