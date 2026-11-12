from rest_framework import serializers

from .models import Goal, Measurement, Milestone, ProgressPhoto, WorkoutLog


class MeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Measurement
        fields = [
            "id",
            "date",
            "weight",
            "body_fat",
            "muscle",
            "bmi",
            "chest",
            "waist",
            "arms",
            "steps",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ["id", "key", "label", "start", "goal", "unit", "color"]
        read_only_fields = ["id"]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "title", "date", "done", "pr", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProgressPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressPhoto
        fields = ["id", "label", "weight", "src", "date", "category"]
        read_only_fields = ["id"]


class WorkoutLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutLog
        fields = ["id", "date", "volume", "pace", "distance", "created_at"]
        read_only_fields = ["id", "created_at"]
