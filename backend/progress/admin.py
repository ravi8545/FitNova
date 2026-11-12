from django.contrib import admin
from .models import ProgressMilestone, ProgressPhoto, WorkoutLog


@admin.register(ProgressMilestone)
class ProgressMilestoneAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "date", "done", "pr", "category")
    list_filter = ("done", "pr", "date")
    search_fields = ("user__email", "title")


@admin.register(ProgressPhoto)
class ProgressPhotoAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "weight", "date", "category")
    list_filter = ("category", "date")
    search_fields = ("user__email", "label")


@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "volume", "pace", "distance", "created_at")
    list_filter = ("date",)
    search_fields = ("user__email",)

