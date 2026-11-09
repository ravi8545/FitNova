from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError
from profiles.models import Profile
from profiles.services.health.health_service import HealthService


class ProfileService:
    """
    Handles profile business logic.
    """

    @staticmethod
    @transaction.atomic
    def refresh_health_metrics(profile):
        """
        Recalculate all health metrics and save them.
        """

        metrics = HealthService.calculate_profile_metrics(profile)

        profile.bmi = metrics["bmi"]
        profile.bmr = metrics["bmr"]
        profile.daily_calories = metrics["daily_calories"]
        profile.daily_water = metrics["daily_water"]

        profile.daily_protein = metrics["daily_protein"]
        profile.daily_carbohydrates = metrics["daily_carbohydrates"]
        profile.daily_fat = metrics["daily_fat"]
        profile.daily_fiber = metrics["daily_fiber"]

        profile.save(
            update_fields=[
                "bmi",
                "bmr",
                "daily_calories",
                "daily_water",
                "daily_protein",
                "daily_carbohydrates",
                "daily_fat",
                "daily_fiber",
                ]
        )

        return profile
    @classmethod
    @transaction.atomic
    def create_profile(cls, user, validated_data):
        try:
            profile = Profile.objects.create(
                user=user,
                **validated_data,
            )
        except IntegrityError:
            raise ValidationError(
                {"detail": "Profile already exists for this user."}
            )

        return cls.refresh_health_metrics(profile)

    @classmethod
    @transaction.atomic
    def update_profile(cls, profile, validated_data):
        """
        Update profile and refresh health metrics.
        """

        for field, value in validated_data.items():
            setattr(profile, field, value)

        profile.save(update_fields=list(validated_data.keys()))

        return cls.refresh_health_metrics(profile)