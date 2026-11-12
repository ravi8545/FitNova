from django.db import transaction
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from profiles.models import Profile
from profiles.serializers import (
    ProfileCreateSerializer,
    ProfileDetailSerializer,
    ProfileUpdateSerializer,
)



class ProfileCreateView(generics.CreateAPIView):
    """
    Create profile.
    """

    serializer_class = ProfileCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)


class ProfileDetailView(generics.RetrieveAPIView):
    """
    Retrieve authenticated user's profile.
    """

    serializer_class = ProfileDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class ProfileUpdateView(generics.UpdateAPIView):
    """
    Update authenticated user's profile.
    """

    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile