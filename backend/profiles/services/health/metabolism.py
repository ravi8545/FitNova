from .body import BodyCalculator
from .constants import (
    ACTIVITY_MULTIPLIERS,
    GOAL_CALORIE_ADJUSTMENTS,
    ROUND_DECIMALS,
)


class MetabolismCalculator:
    """
    Performs metabolism-related calculations.

    Responsibilities:
    - BMR (Basal Metabolic Rate)
    - TDEE (Total Daily Energy Expenditure)
    - Goal Calories
    """

    @staticmethod
    def calculate_bmr(profile):
        """
        Calculate Basal Metabolic Rate using
        the Mifflin-St Jeor Equation.
        """

        age = BodyCalculator.calculate_age(profile.date_of_birth)

        weight = float(profile.current_weight)
        height = float(profile.height)

        if profile.gender == "male":
            bmr = (
                (10 * weight)
                + (6.25 * height)
                - (5 * age)
                + 5
            )
        else:
            bmr = (
                (10 * weight)
                + (6.25 * height)
                - (5 * age)
                - 161
            )

        return round(bmr, ROUND_DECIMALS)

    @staticmethod
    def calculate_tdee(bmr, activity_level):
        """
        Calculate Total Daily Energy Expenditure.
        """

        multiplier = ACTIVITY_MULTIPLIERS.get(activity_level)

        if multiplier is None:
            raise ValueError(
                f"Invalid activity level: {activity_level}"
            )

        tdee = bmr * multiplier

        return round(tdee, ROUND_DECIMALS)

    @staticmethod
    def calculate_goal_calories(tdee, fitness_goal):
        """
        Calculate target daily calories
        based on the user's fitness goal.
        """

        adjustment = GOAL_CALORIE_ADJUSTMENTS.get(fitness_goal)

        if adjustment is None:
            raise ValueError(
                f"Invalid fitness goal: {fitness_goal}"
            )

        goal_calories = tdee + adjustment

        return round(goal_calories, ROUND_DECIMALS)

    @classmethod
    def calculate(cls, profile):
        """
        Generate the complete metabolism report.
        """

        bmr = cls.calculate_bmr(profile)

        tdee = cls.calculate_tdee(
            bmr,
            profile.activity_level,
        )

        goal_calories = cls.calculate_goal_calories(
            tdee,
            profile.fitness_goal,
        )

        return {
            "bmr": bmr,
            "tdee": tdee,
            "goal_calories": goal_calories,
        }