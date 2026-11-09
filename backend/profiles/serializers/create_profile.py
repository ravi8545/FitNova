from rest_framework import serializers

from profiles.models import Profile
from profiles.services.profile_service import ProfileService


class ProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a profile.
    """

    class Meta:
        model = Profile
        fields = (
            "date_of_birth",
            "gender",
            "height",
            "current_weight",
            "target_weight",
            "fitness_goal",
            "activity_level",
        )

    def create(self, validated_data):
        """
        Delegate profile creation to ProfileService.
        """

        user = self.context["request"].user

        return ProfileService.create_profile(
            user=user,
            validated_data=validated_data,
        )