from django.urls import path
from . import views
# as_view allows interaction within the api
urlpatterns = [
  path("mesocycle/", views.MesocycleListCreate.as_view(), name = "note_list"),
  path("mesocycle/delete/<int:pk>", views.MesocycleDelete.as_view(), name = "delete_note"),
  path("mesocycle/<int:pk>/", views.MesocycleDetailUpdate.as_view(), name="mesocycle_detail_update"),
  path("exercise/", views.ExerciseListCreate.as_view(), name ="exercise_list"),
  path("musclegroup/", views.MuscleGroupListCreate.as_view(), name="musclegroup_list"),
  path("session/", views.SessionListCreate.as_view(), name ="session_set"),
]

