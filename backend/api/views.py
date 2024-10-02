from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
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

class SessionDetailUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        authenticated_user = self.request.user
        return Session.objects.filter(user=authenticated_user)

class SetDeleteView(generics.DestroyAPIView):
    serializer_class = SetSerializer

    def get_queryset(self):
        session_id = self.request.query_params.get('session', None)
        if session_id:
            return Set.objects.filter(session_id=session_id)
        return Set.objects.none()

    def delete(self, request, *args, **kwargs):
        session_id = request.query_params.get('session', None)
        if session_id:
            sets = self.get_queryset()
            count = sets.count()
            sets.delete()  # Deletes all sets associated with the session
            return Response({"deleted": count}, status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "No session ID provided."}, status=status.HTTP_400_BAD_REQUEST)

class ExerciseListCreate(generics.ListCreateAPIView):

  #.objects.all() gives all the data
  serializer_class = ExerciseSerializer
  permission_classes = [AllowAny]
  queryset =Exercise.objects.all()

class ExerciseRetrieve(generics.RetrieveAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [AllowAny]

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

class SetListCreate(generics.ListCreateAPIView):
    serializer_class = SetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter sets by sessions that belong to the authenticated user and mesocycle
        authenticated_user = self.request.user
        mesocycle_id = self.request.query_params.get('mesocycle')

        # If a mesocycle ID is provided, filter sets by sessions in that mesocycle
        if mesocycle_id:
            return Set.objects.filter(session__mesocycle_id=mesocycle_id, session__user=authenticated_user)
        
        # Return sets for all sessions of the authenticated user if no mesocycle is provided
        return Set.objects.filter(session__user=authenticated_user)
    def perform_create(self, serializer):
        if serializer.is_valid():
            # Optionally, you can set any additional data here before saving
            serializer.save()
        else:
            print(serializer.errors)

class SessionListAPIView(generics.ListAPIView):
    serializer_class = SessionSerializer

    def get_queryset(self):
        mesocycle_id = self.request.query_params.get('mesocycle')
        if mesocycle_id:
            return Session.objects.filter(mesocycle_id=mesocycle_id)
        return Session.objects.none()  # Return an empty queryset if no mesocycle is provided

class SetListView(generics.ListAPIView):
    serializer_class = SetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs.get('session_id', None)
        if session_id:
            print(f"Fetching sets for session ID: {session_id}")
            # Ensure only sets for the specified session are returned
            sets = Set.objects.filter(session_id=session_id)
            print(f"Found sets: {sets}")
            return sets
        else:
            print("No session ID provided.")
        return Set.objects.none()