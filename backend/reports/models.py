from django.db import models
from django.conf import settings
from django.utils import timezone

class DailyHealthLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='daily_health_logs'
    )
    date = models.DateField(default=timezone.localdate)
    
    # Nutrition
    calories_consumed = models.PositiveIntegerField(default=0)
    calories_burned = models.PositiveIntegerField(default=0)
    protein_g = models.DecimalField(max_digits=6, decimal_places=1, default=0.0)
    carbs_g = models.DecimalField(max_digits=6, decimal_places=1, default=0.0)
    fat_g = models.DecimalField(max_digits=6, decimal_places=1, default=0.0)
    water_liters = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    
    # Body Composition
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    muscle_mass_pct = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    body_fat_pct = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    water_pct = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Activity & Sleep
    sleep_hours = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    workout_sessions_count = models.PositiveSmallIntegerField(default=0)
    workout_duration_minutes = models.PositiveIntegerField(default=0)
    workout_summary = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user} - {self.date}"


class ReportGoal(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='report_goals'
    )
    title = models.CharField(max_length=100)
    current_value = models.CharField(max_length=50)
    target_value = models.CharField(max_length=50)
    percentage = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=30, default='#2BAF34')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title}: {self.percentage}%"


class ReportAreaOfImprovement(models.Model):
    ICON_CHOICES = (
        ('water', 'Water Intake'),
        ('sleep', 'Sleep Consistency'),
        ('strength', 'Strength Workouts'),
        ('nutrition', 'Nutrition & Protein'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='improvement_areas'
    )
    title = models.CharField(max_length=150)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, default='water')
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ReportAIInsight(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_insights'
    )
    title = models.CharField(max_length=150, default='AI Performance Report')
    headline = models.CharField(max_length=255)
    description = models.TextField()
    consistency_rate_pct = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    generated_for_date = models.DateField(default=timezone.localdate)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.headline


class RecentActivity(models.Model):
    ICON_CHOICES = (
        ('workout', 'Workout'),
        ('water', 'Water'),
        ('food', 'Food'),
        ('sleep', 'Sleep'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recent_activities'
    )
    title = models.CharField(max_length=150)
    meta = models.CharField(max_length=100)
    date = models.DateField(default=timezone.localdate)
    icon = models.CharField(max_length=30, choices=ICON_CHOICES, default='workout')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
