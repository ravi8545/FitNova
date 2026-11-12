from django.db import models


class Measurement(models.Model):
    """A single body-stats entry logged on a given date.

    Drives the Body Stats page: the recent-measurements table, the weight
    trend chart, the stat cards and the body-composition donut.
    """

    date = models.DateField()
    weight = models.FloatField(help_text="kg")
    body_fat = models.FloatField(help_text="%")
    muscle = models.FloatField(help_text="kg")
    bmi = models.FloatField()

    # Optional body measurements (cm / steps)
    chest = models.FloatField(null=True, blank=True)
    waist = models.FloatField(null=True, blank=True)
    arms = models.FloatField(null=True, blank=True)
    steps = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Newest date first; among same-date rows the most recently saved wins.
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.date} - {self.weight} kg"


class Goal(models.Model):
    """Target value for a tracked metric (weight / fat / muscle / bmi)."""

    METRIC_CHOICES = [
        ("weight", "Weight"),
        ("fat", "Body Fat"),
        ("muscle", "Muscle Mass"),
        ("bmi", "BMI"),
    ]

    key = models.CharField(max_length=20, choices=METRIC_CHOICES, unique=True)
    label = models.CharField(max_length=60)
    start = models.FloatField()
    goal = models.FloatField()
    unit = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=9, default="#22c55e")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.label}: {self.goal}{self.unit}"


class Milestone(models.Model):
    """A Progress-page timeline entry."""

    title = models.CharField(max_length=160)
    date = models.CharField(max_length=20, help_text='Display label e.g. "Jun 8"')
    done = models.BooleanField(default=False)
    pr = models.BooleanField(default=False, help_text="Counts as a personal record")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return self.title


class WorkoutLog(models.Model):
    """A single day's workout stats, driving the Progress page trend chart.

    - volume: total sets completed that day (strength "Workout Volume")
    - pace:   running pace in min/km (cardio "Pace")
    - distance: running distance in km (cardio "Distance")
    """

    date = models.DateField()
    volume = models.IntegerField(default=0, help_text="total sets")
    pace = models.FloatField(null=True, blank=True, help_text="min/km")
    distance = models.FloatField(null=True, blank=True, help_text="km")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.date} - {self.volume} sets"


class ProgressPhoto(models.Model):
    """A progress photo placeholder shown on both pages."""

    label = models.CharField(max_length=60)
    weight = models.FloatField(help_text="kg")
    src = models.URLField(null=True, blank=True)
    date = models.CharField(max_length=20, blank=True)
    category = models.CharField(max_length=40, default="Progress")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.label} ({self.weight} kg)"
