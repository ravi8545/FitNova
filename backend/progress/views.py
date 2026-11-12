from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import ProgressMilestone, ProgressPhoto, WorkoutLog
from .serializers import (
    ProgressMilestoneSerializer,
    ProgressPhotoSerializer,
    WorkoutLogSerializer,
)
from .services import (
    get_progress_overview,
    get_progress_trends,
    get_user_achievements,
)


class ProgressMilestoneViewSet(viewsets.ModelViewSet):
    """CRUD for authenticated user's milestones and PRs."""

    serializer_class = ProgressMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProgressMilestone.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProgressPhotoViewSet(viewsets.ModelViewSet):
    """CRUD and upload endpoint for user's progress photos."""

    serializer_class = ProgressPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ProgressPhoto.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkoutLogViewSet(viewsets.ModelViewSet):
    """CRUD for user's workout logs driving strength and cardio performance metrics."""

    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkoutLog.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        w_date = serializer.validated_data.get("date")

        existing = WorkoutLog.objects.filter(user=request.user, date=w_date).first()
        if existing:
            update_serializer = self.get_serializer(existing, data=request.data, partial=True)
            update_serializer.is_valid(raise_exception=True)
            update_serializer.save()
            return Response(update_serializer.data, status=status.HTTP_200_OK)

        serializer.save(user=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def progress_overview(request):
    """Returns the full Progress overview payload for Progress.jsx."""
    data = get_progress_overview(request.user, request=request)
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def progress_trends_view(request):
    """Returns dual-axis performance trends for strength and cardio across all range windows."""
    data = get_progress_trends(request.user)
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def progress_achievements(request):
    """Returns unlocked and in-progress achievement badges for the authenticated user."""
    achievements = get_user_achievements(request.user)
    return Response(achievements, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def progress_insights(request):
    """Returns dynamic data-driven insights for the user's progress."""
    overview = get_progress_overview(request.user, request=request)
    return Response(overview.get("insights", []), status=status.HTTP_200_OK)

