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


class AnalyticsReportView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        period = request.query_params.get('period', '7d').lower()
        if period not in VALID_PERIODS:
            return Response(
                {'detail': f"Invalid period '{period}'. Valid options are {VALID_PERIODS}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        tab = request.query_params.get('tab', 'overview').lower()
        report_data = AnalyticsService.generate_report(
            user=request.user,
            period=period,
            tab=tab
        )
        return Response(report_data, status=status.HTTP_200_OK)


class DailyHealthLogViewSet(viewsets.ModelViewSet):
    serializer_class = DailyHealthLogSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return DailyHealthLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportGoalViewSet(viewsets.ModelViewSet):
    serializer_class = ReportGoalSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ReportGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportImprovementViewSet(viewsets.ModelViewSet):
    serializer_class = ReportAreaOfImprovementSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ReportAreaOfImprovement.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post', 'patch'])
    def resolve(self, request, pk=None):
        improvement = self.get_object()
        improvement.is_resolved = True
        improvement.save(update_fields=['is_resolved'])
        return Response({'id': improvement.id, 'is_resolved': True}, status=status.HTTP_200_OK)


class RecentActivityViewSet(viewsets.ModelViewSet):
    serializer_class = RecentActivitySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RecentActivity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportAIInsightViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReportAIInsightSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ReportAIInsight.objects.filter(user=self.request.user)
