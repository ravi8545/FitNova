from django.db import models
from django.contrib.auth.models import AbstractUser

from .managers import UserManager


class User(AbstractUser):

    username = None

    email = models.EmailField(
        unique=True
    )

    first_name = models.CharField(
        max_length=150
    )

    last_name = models.CharField(
        max_length=150,
        blank=True
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    is_email_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "first_name",
    ]

    objects = UserManager()

    class Meta:

        ordering = ["-created_at"]

        verbose_name = "User"

        verbose_name_plural = "Users"

    def __str__(self):

        return self.email

    @property
    def full_name(self):

        return f"{self.first_name} {self.last_name}".strip()