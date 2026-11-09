from rest_framework import serializers
from django.utils import timezone
from .models import (
    DailyHealthLog,
    ReportGoal,
    ReportAreaOfImprovement,
    ReportAIInsight,
    RecentActivity,
)

class DailyHealthLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyHealthLog
        fields = (
            'id', 'date', 'calories_consumed', 'calories_burned',
            'protein_g', 'carbs_g', 'fat_g', 'water_liters',
            'weight_kg', 'muscle_mass_pct', 'body_fat_pct', 'water_pct',
            'sleep_hours', 'workout_sessions_count', 'workout_duration_minutes',
            'workout_summary', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        user = self.context['request'].user
        log_date = validated_data.pop('date', timezone.localdate())
        log, _ = DailyHealthLog.objects.update_or_create(
            user=user,
            date=log_date,
            defaults=validated_data
        )
        return log


class ReportGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportGoal
        fields = ('id', 'title', 'current_value', 'target_value', 'percentage', 'color')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReportAreaOfImprovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAreaOfImprovement
        fields = ('id', 'title', 'description', 'icon', 'is_resolved')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReportAIInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAIInsight
        fields = ('id', 'title', 'headline', 'description', 'consistency_rate_pct', 'generated_for_date', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RecentActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecentActivity
        fields = ('id', 'title', 'meta', 'date', 'icon')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
