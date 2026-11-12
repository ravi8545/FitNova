from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"milestones", views.ProgressMilestoneViewSet, basename="milestone")
router.register(r"photos", views.ProgressPhotoViewSet, basename="photo")
router.register(r"workout-logs", views.WorkoutLogViewSet, basename="workout-log")

urlpatterns = [
    # Aggregated overview & trends
    path("overview/", views.progress_overview, name="progress-overview"),
    path("progress/", views.progress_overview, name="progress-legacy"),
    path("trends/", views.progress_trends_view, name="progress-trends"),
    path("progress-trends/", views.progress_trends_view, name="progress-trends-legacy"),
    path("achievements/", views.progress_achievements, name="progress-achievements"),
    path("insights/", views.progress_insights, name="progress-insights"),
    # REST CRUD resources
    path("", include(router.urls)),
]

