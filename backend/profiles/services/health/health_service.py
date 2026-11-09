from .body import BodyCalculator
from .metabolism import MetabolismCalculator
from .nutrition import NutritionCalculator
from .hydration import HydrationCalculator


class HealthService:
    """
    Orchestrates all health calculators.

    Responsibilities:
    - Coordinate calculations
    - Aggregate results
    - Return complete health report

    Does NOT contain business calculations.
    """

    @classmethod
    def generate_health_report(
        cls,
        profile,
        workout_hours=0,
        climate="normal",
    ):
        """
        Generate complete health report.
        """

        # Body Metrics
        body = BodyCalculator.calculate(profile)

        # Metabolism
        metabolism = MetabolismCalculator.calculate(profile)

        # Nutrition
        nutrition = NutritionCalculator.calculate(
            profile=profile,
            goal_calories=metabolism["goal_calories"],
        )

        # Hydration
        hydration = HydrationCalculator.calculate(profile)

        return {
            "body": body,
            "metabolism": metabolism,
            "nutrition": nutrition,
            "hydration": hydration,
        }

    @classmethod
    def calculate_profile_metrics(cls, profile):
        """
        Calculate only the metrics that are stored
        in the Profile model.
        """

        report = HealthService.generate_health_report(profile)

        return {
            "bmi": report["body"]["bmi"],
            "bmr": report["metabolism"]["bmr"],
            "daily_calories": report["metabolism"]["goal_calories"],
            "daily_water": report["hydration"]["total_water_ml"],

            "daily_protein": report["nutrition"]["protein"],
            "daily_carbohydrates": report["nutrition"]["carbohydrates"],
            "daily_fat": report["nutrition"]["fat"],
            "daily_fiber": report["nutrition"]["fiber"],
        }