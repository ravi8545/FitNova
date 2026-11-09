from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = (

            "id",

            "email",

            "first_name",

            "last_name",

            "phone",

            "profile_image",

            "is_email_verified",

            "created_at",

        )

        read_only_fields = (
            "id",
            "email",
            "is_email_verified",
            "created_at",
        )