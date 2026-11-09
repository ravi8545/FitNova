from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AnalyticsReportView,
    DailyHealthLogViewSet,
    ReportGoalViewSet,
    ReportImprovementViewSet,
    RecentActivityViewSet,
)

router = DefaultRouter()
router.register(r'logs', DailyHealthLogViewSet, basename='daily-health-log')
router.register(r'goals', ReportGoalViewSet, basename='report-goal')
router.register(r'improvements', ReportImprovementViewSet, basename='report-improvement')
router.register(r'activities', RecentActivityViewSet, basename='recent-activity')

urlpatterns = [
    path('analytics/', AnalyticsReportView.as_view(), name='report-analytics'),
    path('', include(router.urls)),
]
