from django.conf import settings
from django.db import models


class BodyMeasurement(models.Model):
    """A single body-stats entry logged on a given date by a user.

    Drives the Body Stats page: recent measurements table, weight trend chart,
    stat cards, and body composition breakdown.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="body_measurements",
        db_index=True,
    )
    date = models.DateField(db_index=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight in kg")
    body_fat = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="Body fat %")
    muscle = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Muscle mass in kg")
    bmi = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="Body Mass Index")

    # Circumference measurements (in cm) & activity
    chest = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Chest in cm")
    waist = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Waist in cm")
    arms = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Arms in cm")
    steps = models.PositiveIntegerField(null=True, blank=True, help_text="Daily steps count")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        unique_together = [("user", "date")]
        indexes = [
            models.Index(fields=["user", "-date"]),
        ]

    def save(self, *args, **kwargs):
        # Auto-compute or update BMI using profile height if available
        if self.user_id:
            try:
                profile = getattr(self.user, "profile", None)
                if profile and profile.height and profile.height > 0:
                    h_m = float(profile.height) / 100.0
                    self.bmi = round(float(self.weight) / (h_m * h_m), 1)
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} - {self.date}: {self.weight} kg"


class BodyGoal(models.Model):
    """Target value for a tracked metric (weight / fat / muscle / bmi) per user."""

    METRIC_CHOICES = [
        ("weight", "Weight"),
        ("fat", "Body Fat"),
        ("muscle", "Muscle Mass"),
        ("bmi", "BMI"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="body_goals",
        db_index=True,
    )
    key = models.CharField(max_length=20, choices=METRIC_CHOICES)
    label = models.CharField(max_length=60)
    start = models.DecimalField(max_digits=6, decimal_places=2)
    goal = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=20, default="#22c55e")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]
        unique_together = [("user", "key")]

    def __str__(self):
        return f"{self.user} - {self.label}: {self.goal} {self.unit}"

