from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers

from .models import ProgressMilestone, ProgressPhoto, WorkoutLog


class ProgressMilestoneSerializer(serializers.ModelSerializer):
    date = serializers.DateField(required=False, default=timezone.localdate)

    class Meta:
        model = ProgressMilestone
        fields = [
            "id",
            "title",
            "date",
            "display_date",
            "done",
            "pr",
            "category",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()


class ProgressPhotoSerializer(serializers.ModelSerializer):
    src = serializers.SerializerMethodField()
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)
    date = serializers.DateField(required=False, default=timezone.localdate)

    class Meta:
        model = ProgressPhoto
        fields = [
            "id",
            "label",
            "weight",
            "image",
            "src",
            "date",
            "display_date",
            "category",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "image": {"write_only": True, "required": False},
        }

    def get_src(self, obj):
        request = self.context.get("request")
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.src or None

    def validate_image(self, value):
        if value:
            # Limit file size to 10MB
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 10 MB.")
            # Check content type
            if hasattr(value, "content_type") and not value.content_type.startswith("image/"):
                raise serializers.ValidationError("Only valid image files (JPEG, PNG, WebP) are allowed.")
        return value

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Photo date cannot be in the future.")
        return value

    def validate_weight(self, value):
        if value is not None and (value < Decimal("20.0") or value > Decimal("500.0")):
            raise serializers.ValidationError("Weight must be between 20 kg and 500 kg.")
        return value


class WorkoutLogSerializer(serializers.ModelSerializer):
    volume = serializers.IntegerField(required=False, default=0, min_value=0)
    pace = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)
    distance = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)

    class Meta:
        model = WorkoutLog
        fields = [
            "id",
            "date",
            "volume",
            "pace",
            "distance",
            "duration_minutes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Workout date cannot be in the future.")
        return value

