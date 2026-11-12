"""
FitNova Health Engine Constants

This module contains all configurable values used by the
Health Engine calculations.

Units:
- Height: centimeters (cm)
- Weight: kilograms (kg)
- Water: milliliters (ml)
- Calories: kcal/day
"""

# ==========================================================
# Activity Multipliers
# ==========================================================

# Used for TDEE calculation
# Source: Mifflin-St Jeor Activity Multipliers

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.20,
    "light": 1.375,
    "moderate": 1.55,
    "very_active": 1.725,
    "athlete": 1.90,
}


# ==========================================================
# Goal Calorie Adjustments
# ==========================================================

# Daily calorie adjustment based on fitness goal.

GOAL_CALORIE_ADJUSTMENTS = {
    "weight_loss": -500,
    "maintenance": 0,
    "muscle_gain": 300,
}


# ==========================================================
# Protein Intake (grams per kg body weight)
# ==========================================================

PROTEIN_PER_KG = {
    "weight_loss": 2.0,
    "maintenance": 1.6,
    "muscle_gain": 2.2,
}


# ==========================================================
# Fat Intake
# ==========================================================

# Percentage of total calories allocated to fat.
# 1 gram fat = 9 kcal

FAT_PERCENTAGE = 0.25


# ==========================================================
# Fiber Intake
# ==========================================================

# Recommended grams per 1000 kcal.

FIBER_PER_1000_KCAL = 14


# ==========================================================
# Hydration
# ==========================================================

# Base daily water recommendation.
# 35 ml per kg body weight.

WATER_PER_KG = 35


# Extra water required per workout hour.

WORKOUT_WATER_PER_HOUR = 750


# Extra water depending on climate.

CLIMATE_WATER = {
    "cold": 0,
    "normal": 250,
    "hot": 500,
}


# ==========================================================
# Macronutrients
# ==========================================================

CALORIES_PER_GRAM_PROTEIN = 4
CALORIES_PER_GRAM_CARBOHYDRATE = 4
CALORIES_PER_GRAM_FAT = 9


# ==========================================================
# Health Limits
# ==========================================================

MAX_SUGAR_PERCENT = 10

MAX_SODIUM_MG = 2300

MAX_CHOLESTEROL_MG = 300


# ==========================================================
# BMI Categories (WHO)
# ==========================================================

BMI_CATEGORIES = (
    (18.5, "Underweight"),
    (25.0, "Normal"),
    (30.0, "Overweight"),
    (float("inf"), "Obese"),
)


# ==========================================================
# Healthy BMI Range
# ==========================================================

HEALTHY_BMI_MIN = 18.5
HEALTHY_BMI_MAX = 24.9


# ==========================================================
# Weekly Weight Change
# ==========================================================

CALORIES_PER_KG = 7700


# ==========================================================
# Ideal Body Weight
# ==========================================================

# Devine Formula Base Values

MALE_IDEAL_WEIGHT = 50

FEMALE_IDEAL_WEIGHT = 45.5

IDEAL_WEIGHT_PER_INCH = 2.3


# ==========================================================
# FFMI
# ==========================================================

FFMI_REFERENCE_HEIGHT = 1.80


# ==========================================================
# Default Precision
# ==========================================================

ROUND_DECIMALS = 2