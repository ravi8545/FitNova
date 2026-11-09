from datetime import date

from .constants import (
    BMI_CATEGORIES,
    FEMALE_IDEAL_WEIGHT,
    HEALTHY_BMI_MAX,
    HEALTHY_BMI_MIN,
    MALE_IDEAL_WEIGHT,
    IDEAL_WEIGHT_PER_INCH,
    ROUND_DECIMALS,
)


class BodyCalculator:
    """
    Performs body-related health calculations.

    Responsibilities:
    - Age
    - BMI
    - BMI Category
    - Healthy Weight Range
    - Ideal Weight
    """

    @staticmethod
    def calculate_age(date_of_birth):
        """
        Calculate age from date of birth.
        """

        today = date.today()

        return (
            today.year
            - date_of_birth.year
            - (
                (today.month, today.day)
                < (date_of_birth.month, date_of_birth.day)
            )
        )

    @staticmethod
    def calculate_bmi(
    height: float,
    weight: float,
    ) -> float:
        """
        Calculate Body Mass Index.

        Height: centimeters
        Weight: kilograms
        """

        height_m = float(height) / 100

        bmi = float(weight) / (height_m ** 2)

        return round(bmi, ROUND_DECIMALS)

    @staticmethod
    def calculate_bmi_category(bmi):
        """
        Return WHO BMI category.
        """

        for limit, category in BMI_CATEGORIES:
            if bmi < limit:
                return category

        return "Unknown"

    @staticmethod
    def calculate_healthy_weight_range(height):
        """
        Calculate healthy weight range based on BMI.

        Returns:
            (minimum_weight, maximum_weight)
        """

        height_m = float(height) / 100

        min_weight = HEALTHY_BMI_MIN * (height_m ** 2)
        max_weight = HEALTHY_BMI_MAX * (height_m ** 2)

        return (
            round(min_weight, ROUND_DECIMALS),
            round(max_weight, ROUND_DECIMALS),
        )

    @staticmethod
    def calculate_ideal_weight(height, gender):
        """
        Calculate ideal body weight using the Devine Formula.
        """

        height_inches = float(height) / 2.54

        inches_over_five_feet = max(0, height_inches - 60)

        if gender == "male":
            ideal_weight = (
                MALE_IDEAL_WEIGHT
                + (IDEAL_WEIGHT_PER_INCH * inches_over_five_feet)
            )
        else:
            ideal_weight = (
                FEMALE_IDEAL_WEIGHT
                + (IDEAL_WEIGHT_PER_INCH * inches_over_five_feet)
            )

        return round(ideal_weight, ROUND_DECIMALS)

    @classmethod
    def calculate(cls, profile):
        """
        Generate the complete body report.
        """

        age = cls.calculate_age(profile.date_of_birth)

        bmi = cls.calculate_bmi(
            profile.height,
            profile.current_weight,
        )

        bmi_category = cls.calculate_bmi_category(bmi)

        healthy_weight = cls.calculate_healthy_weight_range(
            profile.height
        )

        ideal_weight = cls.calculate_ideal_weight(
            profile.height,
            profile.gender,
        )

        return {
            "age": age,
            "height": float(profile.height),
            "current_weight": float(profile.current_weight),
            "target_weight": float(profile.target_weight),
            "bmi": bmi,
            "bmi_category": bmi_category,
            "healthy_weight_range": {
                "min": healthy_weight[0],
                "max": healthy_weight[1],
            },
            "ideal_weight": ideal_weight,
        }