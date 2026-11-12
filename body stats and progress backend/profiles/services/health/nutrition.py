from .constants import (
    PROTEIN_PER_KG,
    FAT_PERCENTAGE,
    FIBER_PER_1000_KCAL,
    CALORIES_PER_GRAM_PROTEIN,
    CALORIES_PER_GRAM_CARBOHYDRATE,
    CALORIES_PER_GRAM_FAT,
    ROUND_DECIMALS,
)


class NutritionCalculator:
    """
    Performs nutrition-related calculations.

    Responsibilities:
    - Protein
    - Fat
    - Carbohydrates
    - Fiber
    """

    @staticmethod
    def calculate_protein(weight, fitness_goal):
        """
        Calculate daily protein intake (grams).
        """

        protein_factor = PROTEIN_PER_KG.get(fitness_goal)

        if protein_factor is None:
            raise ValueError(
                f"Invalid fitness goal: {fitness_goal}"
            )

        protein = float(weight) * protein_factor

        return round(protein, ROUND_DECIMALS)

    @staticmethod
    def calculate_fat(goal_calories):
        """
        Calculate daily fat intake (grams).
        """

        fat_calories = goal_calories * FAT_PERCENTAGE

        fat = fat_calories / CALORIES_PER_GRAM_FAT

        return round(fat, ROUND_DECIMALS)

    @staticmethod
    def calculate_carbohydrates(
        goal_calories,
        protein,
        fat,
    ):
        """
        Calculate daily carbohydrate intake (grams).
        """

        protein_calories = (
            protein * CALORIES_PER_GRAM_PROTEIN
        )

        fat_calories = (
            fat * CALORIES_PER_GRAM_FAT
        )

        remaining_calories = (
            goal_calories
            - protein_calories
            - fat_calories
        )

        carbohydrates = (
            remaining_calories
            / CALORIES_PER_GRAM_CARBOHYDRATE
        )

        return round(carbohydrates, ROUND_DECIMALS)

    @staticmethod
    def calculate_fiber(goal_calories):
        """
        Calculate recommended daily fiber intake (grams).
        """

        fiber = (
            goal_calories
            / 1000
        ) * FIBER_PER_1000_KCAL

        return round(fiber, ROUND_DECIMALS)

    @classmethod
    def calculate(cls, profile, goal_calories):
        """
        Generate the complete nutrition report.
        """

        protein = cls.calculate_protein(
            profile.current_weight,
            profile.fitness_goal,
        )

        fat = cls.calculate_fat(goal_calories)

        carbohydrates = cls.calculate_carbohydrates(
            goal_calories,
            protein,
            fat,
        )

        fiber = cls.calculate_fiber(goal_calories)

        return {
            "goal_calories": goal_calories,
            "protein": protein,
            "fat": fat,
            "carbohydrates": carbohydrates,
            "fiber": fiber,
        }
    