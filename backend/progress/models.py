from django.conf import settings
from django.db import models
from django.utils import timezone


class ProgressMilestone(models.Model):
    """A Progress-page timeline milestone or personal record entry."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="progress_milestones",
        db_index=True,
    )
    title = models.CharField(max_length=160)
    date = models.DateField(default=timezone.localdate)
    display_date = models.CharField(max_length=40, blank=True, help_text='Display label e.g. "Jun 8"')
    done = models.BooleanField(default=False)
    pr = models.BooleanField(default=False, help_text="Counts as a personal record")
    category = models.CharField(max_length=50, blank=True, default="Milestone")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user} - {self.title} ({self.date})"


class ProgressPhoto(models.Model):
    """A progress photo entry for before/after comparison and physical transformation tracking."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="progress_photos",
        db_index=True,
    )
    label = models.CharField(max_length=60)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="kg")
    image = models.ImageField(upload_to="progress_photos/", null=True, blank=True)
    src = models.URLField(max_length=500, null=True, blank=True, help_text="External image URL or fallback")
    date = models.DateField(default=timezone.localdate)
    display_date = models.CharField(max_length=40, blank=True, help_text='Display label e.g. "01 Mar 2025"')
    category = models.CharField(max_length=40, default="Progress")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user} - {self.label} ({self.weight} kg)"


class WorkoutLog(models.Model):
    """A single day's workout metrics driving the Progress page trend chart and streak.

    - volume: total sets completed that day (strength "Workout Volume")
    - pace:   running pace in min/km (cardio "Pace")
    - distance: running distance in km (cardio "Distance")
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="progress_workout_logs",
        db_index=True,
    )
    date = models.DateField(db_index=True)
    volume = models.PositiveIntegerField(default=0, help_text="Total workout volume / sets")
    pace = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cardio pace in min/km")
    distance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Cardio distance in km")
    duration_minutes = models.PositiveIntegerField(default=0, help_text="Workout duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        unique_together = [("user", "date")]
        indexes = [
            models.Index(fields=["user", "-date"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.date}: {self.volume} sets, {self.distance} km"

