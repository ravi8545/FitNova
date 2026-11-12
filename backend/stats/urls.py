from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"measurements", views.BodyMeasurementViewSet, basename="measurement")
router.register(r"goals", views.BodyGoalViewSet, basename="goal")

urlpatterns = [
    # Aggregated overview
    path("overview/", views.stats_overview, name="stats-overview"),
    path("body-stats/", views.stats_overview, name="body-stats"),
    path("trends/", views.stats_trends, name="stats-trends"),
    path("composition/", views.stats_composition, name="stats-composition"),
    # REST CRUD resources
    path("", include(router.urls)),
]

