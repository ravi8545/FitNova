from rest_framework import serializers

from profiles.models import Profile


class ProfileDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving profile details.
    """

    class Meta:
        model = Profile
        fields = (
            "id",
            "user",
            "date_of_birth",
            "gender",
            "height",
            "current_weight",
            "target_weight",
            "fitness_goal",
            "activity_level",

            "bmi",
            "bmr",
            "daily_calories",
            "daily_water",

            "daily_protein",
            "daily_carbohydrates",
            "daily_fat",
            "daily_fiber",

            "created_at",
            "updated_at",
        )
        read_only_fields = fields