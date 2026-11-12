from .constants import (
    WATER_PER_KG,
    WORKOUT_WATER_PER_HOUR,
    CLIMATE_WATER,
    ROUND_DECIMALS,
)


class HydrationCalculator:
    """
    Performs hydration-related calculations.

    Responsibilities:
    - Daily water intake
    - Exercise water adjustment
    - Climate adjustment
    """

    @staticmethod
    def calculate_base_water(weight):
        """
        Calculate base daily water intake.

        Formula:
            weight × WATER_PER_KG
        """

        water = float(weight) * WATER_PER_KG

        return round(water, ROUND_DECIMALS)

    @staticmethod
    def calculate_workout_water(workout_hours=0):
        """
        Extra water required during exercise.
        """

        water = workout_hours * WORKOUT_WATER_PER_HOUR

        return round(water, ROUND_DECIMALS)

    @staticmethod
    def calculate_climate_water(climate="normal"):
        """
        Extra water required depending on climate.
        """

        return CLIMATE_WATER.get(climate, 0)

    @classmethod
    def calculate(
        cls,
        profile,
        workout_hours=0,
        climate="normal",
    ):
        """
        Generate hydration report.
        """

        base_water = cls.calculate_base_water(
            profile.current_weight
        )

        workout_water = cls.calculate_workout_water(
            workout_hours
        )

        climate_water = cls.calculate_climate_water(
            climate
        )

        total_water = (
            base_water
            + workout_water
            + climate_water
        )

        return {
            "base_water_ml": base_water,
            "exercise_water_ml": workout_water,
            "climate_water_ml": climate_water,
            "total_water_ml": round(
                total_water,
                ROUND_DECIMALS,
            ),
            "total_water_liters": round(
                total_water / 1000,
                ROUND_DECIMALS,
            ),
        }