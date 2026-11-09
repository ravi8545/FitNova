from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    ordering = ("-created_at",)

    list_display = (

        "email",
        "first_name",
        "last_name",
        "phone",
        "is_email_verified",
        "is_active",
        "is_staff",

    )

    search_fields = (

        "email",
        "first_name",
        "last_name",

    )

    fieldsets = (

        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                )
            },
        ),

        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone",
                    "profile_image",
                )
            },
        ),

        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_email_verified",
                    "groups",
                    "user_permissions",
                )
            },
        ),

        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "created_at",
                    "updated_at",
                )
            },
        ),

    )

    readonly_fields = (

        "created_at",
        "updated_at",

    )

    add_fieldsets = (

        (
            None,
            {
                "classes": ("wide",),
                "fields": (

                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",

                ),
            },
        ),

    )