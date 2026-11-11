from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import (
    DailyHealthLog,
    ReportGoal,
    ReportAreaOfImprovement,
    ReportAIInsight,
    RecentActivity,
)
from .serializers import (
    DailyHealthLogSerializer,
    ReportGoalSerializer,
    ReportAreaOfImprovementSerializer,
    ReportAIInsightSerializer,
    RecentActivitySerializer,
)
from .services import AnalyticsService

VALID_PERIODS = ['7d', '30d', '3m', '1y']


def get_active_user(request):
    if request.user and request.user.is_authenticated:
        return request.user
    from django.contrib.auth import get_user_model
    User = get_user_model()
    return (
        User.objects.filter(email='demo@fitnova.com').first()
        or User.objects.filter(email='ravi@fitnova.com').first()
        or User.objects.first()
    )


class AnalyticsReportView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        period = request.query_params.get('period', '7d').lower()
        if period not in VALID_PERIODS:
            return Response(
                {'detail': f"Invalid period '{period}'. Valid options are {VALID_PERIODS}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        tab = request.query_params.get('tab', 'overview').lower()
        user = get_active_user(request)
        report_data = AnalyticsService.generate_report(
            user=user,
            period=period,
            tab=tab
        )
        return Response(report_data, status=status.HTTP_200_OK)


class DailyHealthLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyHealthLogSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        user = get_active_user(self.request)
        return DailyHealthLog.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=get_active_user(self.request))


class ReportGoalViewSet(viewsets.ModelViewSet):
    serializer_class = ReportGoalSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        user = get_active_user(self.request)
        return ReportGoal.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=get_active_user(self.request))


class ReportImprovementViewSet(viewsets.ModelViewSet):
    serializer_class = ReportAreaOfImprovementSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        user = get_active_user(self.request)
        return ReportAreaOfImprovement.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=get_active_user(self.request))

    @action(detail=True, methods=['post', 'patch'])
    def resolve(self, request, pk=None):
        improvement = self.get_object()
        improvement.is_resolved = True
        improvement.save(update_fields=['is_resolved'])
        return Response({'id': improvement.id, 'is_resolved': True}, status=status.HTTP_200_OK)


class RecentActivityViewSet(viewsets.ModelViewSet):
    serializer_class = RecentActivitySerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        user = get_active_user(self.request)
        return RecentActivity.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=get_active_user(self.request))


class ReportAIInsightViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportAIInsightSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        user = get_active_user(self.request)
        return ReportAIInsight.objects.filter(user=user)
