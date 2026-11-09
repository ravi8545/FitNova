from django.urls import path

from profiles.views import (
    ProfileCreateView,
    ProfileDetailView,
    ProfileUpdateView,
)

app_name = "profiles"

urlpatterns = [
    path(
        "create/",
        ProfileCreateView.as_view(),
        name="create-profile",
    ),
    path(
        "me/",
        ProfileDetailView.as_view(),
        name="profile-detail",
    ),
    path(
        "update/",
        ProfileUpdateView.as_view(),
        name="update-profile",
    ),
]