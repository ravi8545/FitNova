from rest_framework import serializers

from profiles.models import Profile
from profiles.services.profile_service import ProfileService


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a profile.
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

    def update(self, instance, validated_data):
        """
        Delegate profile update to ProfileService.
        """

        return ProfileService.update_profile(
            profile=instance,
            validated_data=validated_data,
        )