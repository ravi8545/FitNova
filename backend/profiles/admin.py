from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "fitness_goal",
        "activity_level",
        "current_weight",
        "target_weight",
    )

    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
    )

    list_filter = (
        "fitness_goal",
        "activity_level",
        "gender",
    )