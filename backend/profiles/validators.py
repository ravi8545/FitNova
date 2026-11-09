from datetime import date

from django.core.exceptions import ValidationError


def validate_date_of_birth(value):
    """
    Validate the user's date of birth.
    """

    today = date.today()

    if value > today:
        raise ValidationError(
            "Date of birth cannot be in the future."
        )

    age = (
        today.year
        - value.year
        - ((today.month, today.day) < (value.month, value.day))
    )

    if age < 5:
        raise ValidationError(
            "User must be at least 5 years old."
        )

    if age > 120:
        raise ValidationError(
            "Please enter a valid date of birth."
        )

    return value