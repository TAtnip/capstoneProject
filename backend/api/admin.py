from django.contrib import admin
from .models import MuscleGroup, Set, Exercise, Mesocycle, Session, PerformanceMetric

# Register your models here.
admin.site.register(MuscleGroup)
admin.site.register(Exercise)
admin.site.register(Mesocycle)
admin.site.register(Session)
admin.site.register(PerformanceMetric)
admin.site.register(Set)