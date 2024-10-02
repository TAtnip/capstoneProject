from django.urls import path
from . import views

urlpatterns = [
    # Mesocycle related endpoints
    path("mesocycle/", views.MesocycleListCreate.as_view(), name="mesocycle_list_create"),
    path("mesocycle/delete/<int:pk>/", views.MesocycleDelete.as_view(), name="mesocycle_delete"),
    path("mesocycle/<int:pk>/", views.MesocycleDetailUpdate.as_view(), name="mesocycle_detail_update"),
    
    # Exercise related endpoints
    path("exercise/", views.ExerciseListCreate.as_view(), name="exercise_list_create"),
    path("exercise/<int:pk>/", views.ExerciseRetrieve.as_view(), name="exercise_detail"),

    # MuscleGroup related endpoints
    path("musclegroup/", views.MuscleGroupListCreate.as_view(), name="musclegroup_list_create"),

    # Session related endpoints
    path("session/", views.SessionListCreate.as_view(), name="session_list_create"),
    path("session/by-mesocycle/<int:mesocycle_id>/", views.SessionListAPIView.as_view(), name="session_by_mesocycle"),
    path("session/<int:pk>/", views.SessionDetailUpdate.as_view(), name="session_detail_update"),


    # Set related endpoints
    path("set/", views.SetListCreate.as_view(), name="set_list_create"),
    path("set/by-session/<int:session_id>/", views.SetListView.as_view(), name="set_by_session"),
    path("set/delete/", views.SetDeleteView.as_view(), name="delete_set")
]

