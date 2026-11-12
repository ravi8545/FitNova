from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers

from .models import BodyGoal, BodyMeasurement


class BodyMeasurementSerializer(serializers.ModelSerializer):
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False)
    body_fat = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True, coerce_to_string=False)
    muscle = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)
    bmi = serializers.DecimalField(max_digits=4, decimal_places=1, required=False, allow_null=True, coerce_to_string=False)
    chest = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)
    waist = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)
    arms = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True, coerce_to_string=False)
    steps = serializers.IntegerField(required=False, allow_null=True, min_value=0)

    class Meta:
        model = BodyMeasurement
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
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_date(self, value):
        today = timezone.localdate()
        if value > today:
            raise serializers.ValidationError("Measurement date cannot be in the future.")
        return value

    def validate_weight(self, value):
        if value is not None and (value < Decimal("20.0") or value > Decimal("500.0")):
            raise serializers.ValidationError("Weight must be between 20 kg and 500 kg.")
        return value

    def validate_body_fat(self, value):
        if value is not None and (value < Decimal("1.0") or value > Decimal("75.0")):
            raise serializers.ValidationError("Body fat percentage must be between 1% and 75%.")
        return value

    def validate_muscle(self, value):
        if value is not None and value < Decimal("5.0"):
            raise serializers.ValidationError("Muscle mass must be at least 5 kg.")
        return value

    def validate(self, attrs):
        weight = attrs.get("weight")
        muscle = attrs.get("muscle")
        if weight is not None and muscle is not None and muscle >= weight:
            raise serializers.ValidationError({"muscle": "Muscle mass cannot be greater than or equal to total body weight."})
        return attrs


class BodyGoalSerializer(serializers.ModelSerializer):
    start = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=False)
    goal = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = BodyGoal
        fields = [
            "id",
            "key",
            "label",
            "start",
            "goal",
            "unit",
            "color",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_key(self, value):
        allowed = ["weight", "fat", "muscle", "bmi"]
        if value not in allowed:
            raise serializers.ValidationError(f"Goal key must be one of {allowed}.")
        return value

    def validate(self, attrs):
        start = attrs.get("start")
        goal = attrs.get("goal")
        if start is not None and start <= 0:
            raise serializers.ValidationError({"start": "Start value must be greater than zero."})
        if goal is not None and goal <= 0:
            raise serializers.ValidationError({"goal": "Goal value must be greater than zero."})
        return attrs

