from django.contrib import admin

from .models import Goal, Measurement, Milestone, ProgressPhoto, WorkoutLog


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "weight",
        "body_fat",
        "muscle",
        "bmi",
        "chest",
        "waist",
        "arms",
        "steps",
    )
    ordering = ("-date",)


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "start", "goal", "unit")


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "done", "pr", "created_at")
    list_filter = ("done", "pr")


@admin.register(ProgressPhoto)
class ProgressPhotoAdmin(admin.ModelAdmin):
    list_display = ("label", "weight", "category", "date", "src")


@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ("date", "volume", "pace", "distance")
    ordering = ("-date",)
