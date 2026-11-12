from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import BodyGoal, BodyMeasurement
from .serializers import BodyGoalSerializer, BodyMeasurementSerializer
from .services import _build_trend, get_body_stats_overview


class BodyMeasurementViewSet(viewsets.ModelViewSet):
    """CRUD for authenticated user's body measurements."""

    serializer_class = BodyMeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BodyMeasurement.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a measurement or update existing for that date for this user."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        m_date = serializer.validated_data.get("date")

        existing = BodyMeasurement.objects.filter(user=request.user, date=m_date).first()
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


class BodyGoalViewSet(viewsets.ModelViewSet):
    """CRUD for authenticated user's body metric goals."""

    serializer_class = BodyGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BodyGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        key = serializer.validated_data.get("key")
        existing = BodyGoal.objects.filter(user=self.request.user, key=key).first()
        if existing:
            for attr, val in serializer.validated_data.items():
                setattr(existing, attr, val)
            existing.save()
            return
        serializer.save(user=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def stats_overview(request):
    """Returns the complete aggregated overview payload for BodyStats page."""
    data = get_body_stats_overview(request.user)
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def stats_trends(request):
    """Returns weight trend points strictly validated for 7d, 30d, 90d."""
    raw_range = request.query_params.get("range", "30d").lower()
    allowed_ranges = {"7d": 7, "30d": 30, "90d": 90, "7": 7, "30": 30, "90": 90}
    if raw_range not in allowed_ranges:
        return Response(
            {"detail": "Invalid range parameter. Allowed values are '7d', '30d', or '90d'."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    days = allowed_ranges[raw_range]

    measurements = list(BodyMeasurement.objects.filter(user=request.user).order_by("-date", "-created_at"))
    trend = _build_trend(measurements, days)
    return Response(trend, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def stats_composition(request):
    """Returns current body composition breakdown for the user."""
    overview = get_body_stats_overview(request.user)
    return Response(overview.get("composition", {}), status=status.HTTP_200_OK)

