from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"measurements", views.MeasurementViewSet)
router.register(r"goals", views.GoalViewSet)
router.register(r"milestones", views.MilestoneViewSet)
router.register(r"photos", views.ProgressPhotoViewSet)
router.register(r"workouts", views.WorkoutLogViewSet)

urlpatterns = [
    # Aggregate read endpoints for the two pages
    path("body-stats/", views.body_stats, name="body-stats"),
    path("progress/", views.progress, name="progress"),
    path("progress-trends/", views.progress_trends, name="progress-trends"),
    # CRUD resources
    path("", include(router.urls)),
]
