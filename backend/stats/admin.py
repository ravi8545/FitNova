from django.contrib import admin
from .models import BodyMeasurement, BodyGoal


@admin.register(BodyMeasurement)
class BodyMeasurementAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "weight", "body_fat", "muscle", "bmi", "created_at")
    list_filter = ("date", "created_at")
    search_fields = ("user__email", "user__username")
    ordering = ("-date",)


@admin.register(BodyGoal)
class BodyGoalAdmin(admin.ModelAdmin):
    list_display = ("user", "key", "label", "start", "goal", "unit", "color")
    list_filter = ("key",)
    search_fields = ("user__email", "label")

