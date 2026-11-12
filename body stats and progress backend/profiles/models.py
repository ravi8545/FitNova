from uuid import uuid4

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from profiles.validators import validate_date_of_birth


class Profile(models.Model):

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"

    class FitnessGoal(models.TextChoices):
        WEIGHT_LOSS = "weight_loss", "Weight Loss"
        MUSCLE_GAIN = "muscle_gain", "Muscle Gain"
        MAINTENANCE = "maintenance", "Maintenance"

    class ActivityLevel(models.TextChoices):
        SEDENTARY = "sedentary", "Sedentary"
        LIGHT = "light", "Lightly Active"
        MODERATE = "moderate", "Moderately Active"
        VERY_ACTIVE = "very_active", "Very Active"
        ATHLETE = "athlete", "Athlete"

    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False,
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    date_of_birth = models.DateField(
    validators=[
        validate_date_of_birth,
        ]
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )

    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(50),
            MaxValueValidator(300),
        ],
        help_text="Height in centimeters",
    )

    current_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(20),
            MaxValueValidator(500),
        ],
        help_text="Current weight in kilograms",
    )

    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(20),
            MaxValueValidator(500),
        ],
        help_text="Target weight in kilograms",
    )

    fitness_goal = models.CharField(
        max_length=20,
        choices=FitnessGoal.choices,
    )

    activity_level = models.CharField(
        max_length=20,
        choices=ActivityLevel.choices,
    )

    # ==========================
    # Calculated Health Metrics
    # ==========================

    bmi = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        editable=False,
    )

    bmr = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0,
        editable=False,
    )

    daily_calories = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0,
        editable=False,
        )

    daily_water = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0,
        editable=False,
    )
    daily_protein = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        editable=False,
    )

    daily_carbohydrates = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        editable=False,
    )

    daily_fat = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        editable=False,
    )

    daily_fiber = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
        editable=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def __str__(self):
        return f"{self.user.full_name}'s Profile"