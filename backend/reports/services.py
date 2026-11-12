from datetime import timedelta
from django.utils import timezone
from .models import (
    DailyHealthLog,
    ReportGoal,
    ReportAreaOfImprovement,
    ReportAIInsight,
    RecentActivity,
)
from supplements.models import (
    UserSupplementStack,
    SupplementDailyLog,
    SupplementReminder,
)

def format_day(d):
    return f"{d.day} {d.strftime('%b')}"

def format_day_year(d):
    return f"{d.day} {d.strftime('%b %Y')}"

def calculate_trend(current_val, prev_val, has_prev_logs, higher_is_better=True, unit="%"):
    """
    Computes percentage change vs previous period.
    A missing previous-period baseline is represented as None / 'No previous data', NOT 0%.
    Positive/negative status strictly depends on metric direction and goals.
    """
    if not has_prev_logs or prev_val is None or prev_val == 0:
        return None, True, "No previous data", None

    change_pct = round(((current_val - prev_val) / float(prev_val)) * 100)
    sign = "+" if change_pct > 0 else ""
    change_str = f"{sign}{change_pct}{unit}"
    is_positive = (change_pct >= 0) if higher_is_better else (change_pct <= 0)
    comparison_text = "vs previous period"
    return change_str, is_positive, comparison_text, change_pct


class AnalyticsService:
    @staticmethod
    def get_date_range(period='7d'):
        today = timezone.localdate()
        if period == '30d':
            days = 30
        elif period == '3m':
            days = 90
        elif period == '1y':
            days = 365
        else:
            days = 7
        start_date = today - timedelta(days=days - 1)
        prev_start_date = start_date - timedelta(days=days)
        prev_end_date = start_date - timedelta(days=1)
        return start_date, today, prev_start_date, prev_end_date, days

    @classmethod
    def generate_report(cls, user, period='7d', tab='overview'):
        start_date, end_date, prev_start_date, prev_end_date, days = cls.get_date_range(period)
        normalized_tab = (tab or 'overview').lower()

        logs = DailyHealthLog.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).order_by('date')

        prev_logs = DailyHealthLog.objects.filter(
            user=user,
            date__range=[prev_start_date, prev_end_date]
        )

        has_logs = logs.exists()
        has_prev_logs = prev_logs.exists()

        if has_logs:
            total_calories = sum(log.calories_consumed for log in logs)
            total_burned = sum(log.calories_burned for log in logs)
            total_protein = sum(float(log.protein_g) for log in logs)
            total_carbs = sum(float(log.carbs_g) for log in logs)
            total_fat = sum(float(log.fat_g) for log in logs)
            total_water = sum(float(log.water_liters) for log in logs)
            avg_water = round(total_water / len(logs), 1)
            total_workouts = sum(log.workout_sessions_count for log in logs)
            total_duration = sum(log.workout_duration_minutes for log in logs)
            total_sleep = sum(float(log.sleep_hours) for log in logs)
            avg_sleep = round(total_sleep / len(logs), 1)

            prev_calories = sum(log.calories_consumed for log in prev_logs) if has_prev_logs else 0
            prev_burned = sum(log.calories_burned for log in prev_logs) if has_prev_logs else 0
            prev_protein = sum(float(log.protein_g) for log in prev_logs) if has_prev_logs else 0.0
            prev_carbs = sum(float(log.carbs_g) for log in prev_logs) if has_prev_logs else 0.0
            prev_fat = sum(float(log.fat_g) for log in prev_logs) if has_prev_logs else 0.0
            prev_water = (sum(float(log.water_liters) for log in prev_logs) / len(prev_logs)) if has_prev_logs else 0.0
            prev_workouts = sum(log.workout_sessions_count for log in prev_logs) if has_prev_logs else 0
            prev_duration = sum(log.workout_duration_minutes for log in prev_logs) if has_prev_logs else 0
            prev_sleep = (sum(float(log.sleep_hours) for log in prev_logs) / len(prev_logs)) if has_prev_logs else 0.0

            cal_sparkline = [log.calories_consumed for log in logs][-7:]
            burned_sparkline = [log.calories_burned for log in logs][-7:]
            protein_sparkline = [int(log.protein_g) for log in logs][-7:]
            carbs_sparkline = [int(log.carbs_g) for log in logs][-7:]
            fat_sparkline = [int(log.fat_g) for log in logs][-7:]
            water_sparkline = [float(log.water_liters) for log in logs][-7:]
            workout_sparkline = [log.workout_sessions_count * 10 for log in logs][-7:]
            duration_sparkline = [log.workout_duration_minutes for log in logs][-7:]
            sleep_sparkline = [float(log.sleep_hours) for log in logs][-7:]
        else:
            total_calories = 0
            total_burned = 0
            total_protein = 0.0
            total_carbs = 0.0
            total_fat = 0.0
            total_water = 0.0
            avg_water = 0.0
            total_workouts = 0
            total_duration = 0
            total_sleep = 0.0
            avg_sleep = 0.0

            prev_calories = 0
            prev_burned = 0
            prev_protein = 0.0
            prev_carbs = 0.0
            prev_fat = 0.0
            prev_water = 0.0
            prev_workouts = 0
            prev_duration = 0
            prev_sleep = 0.0

            cal_sparkline = []
            burned_sparkline = []
            protein_sparkline = []
            carbs_sparkline = []
            fat_sparkline = []
            water_sparkline = []
            workout_sparkline = []
            duration_sparkline = []
            sleep_sparkline = []

        avg_days = len(logs) if has_logs else 1

        # Calculate accurate baseline trends
        cal_trend = calculate_trend(total_calories, prev_calories, has_prev_logs, higher_is_better=True)
        burned_trend = calculate_trend(total_burned, prev_burned, has_prev_logs, higher_is_better=True)
        protein_trend = calculate_trend(total_protein, prev_protein, has_prev_logs, higher_is_better=True)
        carbs_trend = calculate_trend(total_carbs, prev_carbs, has_prev_logs, higher_is_better=True)
        fat_trend = calculate_trend(total_fat, prev_fat, has_prev_logs, higher_is_better=True)
        water_trend = calculate_trend(avg_water, prev_water, has_prev_logs, higher_is_better=True)
        workout_trend = calculate_trend(total_workouts, prev_workouts, has_prev_logs, higher_is_better=True)
        duration_trend = calculate_trend(total_duration, prev_duration, has_prev_logs, higher_is_better=True)
        sleep_trend = calculate_trend(avg_sleep, prev_sleep, has_prev_logs, higher_is_better=True)

        # Tab-specific KPI metrics and summary construction
        if normalized_tab == 'nutrition':
            kpi_metrics = [
                {
                    'id': 'kpi-calories',
                    'title': 'Calories In',
                    'value': f"{total_calories:,}",
                    'target': f"{2000 * days:,} kcal",
                    'change': cal_trend[0],
                    'isPositive': cal_trend[1],
                    'comparisonText': cal_trend[2],
                    'type': 'calories',
                    'sparklineData': cal_sparkline,
                },
                {
                    'id': 'kpi-protein',
                    'title': 'Protein',
                    'value': f"{int(total_protein):,}g",
                    'target': f"{150 * days:,}g",
                    'change': protein_trend[0],
                    'isPositive': protein_trend[1],
                    'comparisonText': protein_trend[2],
                    'type': 'protein',
                    'sparklineData': protein_sparkline,
                },
                {
                    'id': 'kpi-carbs',
                    'title': 'Carbohydrates',
                    'value': f"{int(total_carbs):,}g",
                    'target': f"{220 * days:,}g",
                    'change': carbs_trend[0],
                    'isPositive': carbs_trend[1],
                    'comparisonText': carbs_trend[2],
                    'type': 'nutrition',
                    'sparklineData': carbs_sparkline,
                },
                {
                    'id': 'kpi-fat',
                    'title': 'Fats',
                    'value': f"{int(total_fat):,}g",
                    'target': f"{60 * days:,}g",
                    'change': fat_trend[0],
                    'isPositive': fat_trend[1],
                    'comparisonText': fat_trend[2],
                    'type': 'nutrition',
                    'sparklineData': fat_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Daily Calories', 'value': f"{int(total_calories / avg_days):,} kcal" if has_logs else "0 kcal", 'change': cal_trend[0] or "N/A", 'positive': cal_trend[1]},
                {'label': 'Avg. Daily Protein', 'value': f"{int(total_protein / avg_days)} g" if has_logs else "0 g", 'change': protein_trend[0] or "N/A", 'positive': protein_trend[1]},
                {'label': 'Avg. Daily Carbs', 'value': f"{int(total_carbs / avg_days)} g" if has_logs else "0 g", 'change': carbs_trend[0] or "N/A", 'positive': carbs_trend[1]},
                {'label': 'Avg. Daily Fats', 'value': f"{int(total_fat / avg_days)} g" if has_logs else "0 g", 'change': fat_trend[0] or "N/A", 'positive': fat_trend[1]},
            ]
        elif normalized_tab == 'workouts':
            kpi_metrics = [
                {
                    'id': 'kpi-workouts',
                    'title': 'Total Workouts',
                    'value': f"{total_workouts} sessions",
                    'target': f"{max(1, round(days * 0.6))} sessions",
                    'change': workout_trend[0],
                    'isPositive': workout_trend[1],
                    'comparisonText': workout_trend[2],
                    'type': 'workouts',
                    'sparklineData': workout_sparkline,
                },
                {
                    'id': 'kpi-duration',
                    'title': 'Total Duration',
                    'value': f"{total_duration} mins",
                    'target': f"{round(days * 35)} mins",
                    'change': duration_trend[0],
                    'isPositive': duration_trend[1],
                    'comparisonText': duration_trend[2],
                    'type': 'workouts',
                    'sparklineData': duration_sparkline,
                },
                {
                    'id': 'kpi-burned',
                    'title': 'Calories Burned',
                    'value': f"{total_burned:,} kcal",
                    'target': f"{400 * days:,} kcal",
                    'change': burned_trend[0],
                    'isPositive': burned_trend[1],
                    'comparisonText': burned_trend[2],
                    'type': 'calories',
                    'sparklineData': burned_sparkline,
                },
                {
                    'id': 'kpi-avg-session',
                    'title': 'Avg Duration / Workout',
                    'value': f"{int(total_duration / total_workouts) if total_workouts > 0 else 0} mins",
                    'target': '45 mins',
                    'change': None,
                    'isPositive': True,
                    'comparisonText': 'per session target',
                    'type': 'workouts',
                    'sparklineData': duration_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Total Workouts', 'value': f"{total_workouts} sessions", 'change': workout_trend[0] or "N/A", 'positive': workout_trend[1]},
                {'label': 'Total Duration', 'value': f"{total_duration} mins", 'change': duration_trend[0] or "N/A", 'positive': duration_trend[1]},
                {'label': 'Total Burned', 'value': f"{total_burned:,} kcal", 'change': burned_trend[0] or "N/A", 'positive': burned_trend[1]},
                {'label': 'Avg Duration', 'value': f"{int(total_duration / total_workouts) if total_workouts > 0 else 0} mins", 'change': 'Target: 45m', 'positive': True},
            ]
        elif normalized_tab == 'water-intake':
            kpi_metrics = [
                {
                    'id': 'kpi-water-avg',
                    'title': 'Daily Avg Water',
                    'value': f"{avg_water} L",
                    'target': '3.5 L',
                    'change': water_trend[0],
                    'isPositive': water_trend[1],
                    'comparisonText': water_trend[2],
                    'type': 'water',
                    'sparklineData': water_sparkline,
                },
                {
                    'id': 'kpi-water-total',
                    'title': 'Total Water',
                    'value': f"{round(total_water, 1)} L",
                    'target': f"{round(days * 3.5, 1)} L",
                    'change': water_trend[0],
                    'isPositive': water_trend[1],
                    'comparisonText': 'period target',
                    'type': 'water',
                    'sparklineData': water_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Daily Water', 'value': f"{avg_water} L" if has_logs else "0.0 L", 'change': water_trend[0] or "N/A", 'positive': water_trend[1]},
                {'label': 'Total Water Intake', 'value': f"{round(total_water, 1)} L" if has_logs else "0.0 L", 'change': water_trend[0] or "N/A", 'positive': water_trend[1]},
            ]
        elif normalized_tab == 'sleep':
            kpi_metrics = [
                {
                    'id': 'kpi-sleep-avg',
                    'title': 'Avg Nightly Sleep',
                    'value': f"{avg_sleep} hrs",
                    'target': '8.0 hrs',
                    'change': sleep_trend[0],
                    'isPositive': sleep_trend[1],
                    'comparisonText': sleep_trend[2],
                    'type': 'sleep',
                    'sparklineData': sleep_sparkline,
                },
                {
                    'id': 'kpi-sleep-total',
                    'title': 'Total Sleep Time',
                    'value': f"{round(total_sleep, 1)} hrs",
                    'target': f"{round(days * 8.0, 1)} hrs",
                    'change': sleep_trend[0],
                    'isPositive': sleep_trend[1],
                    'comparisonText': 'period target',
                    'type': 'sleep',
                    'sparklineData': sleep_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Sleep', 'value': f"{avg_sleep} hrs" if has_logs else "0.0 hrs", 'change': sleep_trend[0] or "N/A", 'positive': sleep_trend[1]},
                {'label': 'Total Sleep', 'value': f"{round(total_sleep, 1)} hrs" if has_logs else "0.0 hrs", 'change': sleep_trend[0] or "N/A", 'positive': sleep_trend[1]},
            ]
        elif normalized_tab == 'supplements':
            active_supplements = UserSupplementStack.objects.filter(user=user, status='Active')
            active_count = active_supplements.count()
            planned_doses = active_count * days
            doses_taken = SupplementDailyLog.objects.filter(
                user=user,
                date__range=[start_date, end_date],
                is_taken=True
            ).count()
            adherence_rate = round((doses_taken / planned_doses) * 100) if planned_doses > 0 else (100 if doses_taken > 0 else 0)
            reminders_active = SupplementReminder.objects.filter(user=user, is_enabled=True).count()

            # Real streak calculation
            today = timezone.localdate()
            streak_days = 0
            cur = today
            while True:
                has_supp_log = SupplementDailyLog.objects.filter(user=user, date=cur, is_taken=True).exists()
                if has_supp_log:
                    streak_days += 1
                    cur -= timedelta(days=1)
                else:
                    if cur == today:
                        cur -= timedelta(days=1)
                        continue
                    break

            kpi_metrics = [
                {
                    'id': 'kpi-supp-adherence',
                    'title': 'Adherence Rate',
                    'value': f"{adherence_rate}%",
                    'target': '100%',
                    'change': None,
                    'isPositive': adherence_rate >= 80,
                    'comparisonText': f"{doses_taken} of {planned_doses} doses taken",
                    'type': 'supplements',
                    'sparklineData': [],
                },
                {
                    'id': 'kpi-supp-active',
                    'title': 'Active Supplements',
                    'value': str(active_count),
                    'target': 'In stack',
                    'change': None,
                    'isPositive': True,
                    'comparisonText': 'personal active stack',
                    'type': 'supplements',
                    'sparklineData': [],
                },
                {
                    'id': 'kpi-supp-streak',
                    'title': 'Adherence Streak',
                    'value': f"{streak_days} days",
                    'target': '14 days',
                    'change': None,
                    'isPositive': streak_days > 0,
                    'comparisonText': 'consecutive days logged',
                    'type': 'supplements',
                    'sparklineData': [],
                },
                {
                    'id': 'kpi-supp-reminders',
                    'title': 'Active Reminders',
                    'value': str(reminders_active),
                    'target': f"{active_count} reminders",
                    'change': None,
                    'isPositive': True,
                    'comparisonText': 'scheduled notifications',
                    'type': 'supplements',
                    'sparklineData': [],
                },
            ]
            report_summary = [
                {'label': 'Adherence Rate', 'value': f"{adherence_rate}%", 'change': f"{doses_taken}/{planned_doses} doses", 'positive': adherence_rate >= 80},
                {'label': 'Active Stack Items', 'value': f"{active_count} items", 'change': 'Active', 'positive': True},
                {'label': 'Streak Days', 'value': f"{streak_days} days", 'change': f"{streak_days}d streak", 'positive': streak_days > 0},
                {'label': 'Active Reminders', 'value': f"{reminders_active}", 'change': 'Configured', 'positive': True},
            ]
        elif normalized_tab == 'body-stats':
            weight_logs = [log for log in logs if log.weight_kg is not None]
            muscle_logs = [log for log in logs if log.muscle_mass_pct is not None]
            fat_logs = [log for log in logs if log.body_fat_pct is not None]

            prev_weight_logs = [log for log in prev_logs if log.weight_kg is not None]
            prev_fat_logs = [log for log in prev_logs if log.body_fat_pct is not None]

            latest_weight = float(weight_logs[-1].weight_kg) if weight_logs else None
            latest_muscle = float(muscle_logs[-1].muscle_mass_pct) if muscle_logs else None
            latest_fat = float(fat_logs[-1].body_fat_pct) if fat_logs else None

            prev_weight = float(prev_weight_logs[-1].weight_kg) if prev_weight_logs else None
            prev_fat = float(prev_fat_logs[-1].body_fat_pct) if prev_fat_logs else None

            weight_trend = calculate_trend(latest_weight, prev_weight, bool(prev_weight_logs), higher_is_better=False, unit=" kg") if latest_weight is not None else (None, True, "No previous data", None)
            fat_trend = calculate_trend(latest_fat, prev_fat, bool(prev_fat_logs), higher_is_better=False, unit="%") if latest_fat is not None else (None, True, "No previous data", None)

            kpi_metrics = [
                {
                    'id': 'kpi-weight',
                    'title': 'Current Weight',
                    'value': f"{latest_weight} kg" if latest_weight is not None else "--",
                    'target': '75 kg',
                    'change': weight_trend[0],
                    'isPositive': weight_trend[1],
                    'comparisonText': weight_trend[2],
                    'type': 'weight',
                    'sparklineData': [float(log.weight_kg) for log in weight_logs][-7:],
                },
                {
                    'id': 'kpi-muscle',
                    'title': 'Muscle Mass',
                    'value': f"{latest_muscle}%" if latest_muscle is not None else "--",
                    'target': '45%',
                    'change': None,
                    'isPositive': True,
                    'comparisonText': 'body composition target',
                    'type': 'body',
                    'sparklineData': [float(log.muscle_mass_pct) for log in muscle_logs][-7:],
                },
                {
                    'id': 'kpi-body-fat',
                    'title': 'Body Fat',
                    'value': f"{latest_fat}%" if latest_fat is not None else "--",
                    'target': '15%',
                    'change': fat_trend[0],
                    'isPositive': fat_trend[1],
                    'comparisonText': fat_trend[2],
                    'type': 'body',
                    'sparklineData': [float(log.body_fat_pct) for log in fat_logs][-7:],
                },
            ]
            report_summary = [
                {'label': 'Current Weight', 'value': f"{latest_weight} kg" if latest_weight is not None else "No data", 'change': weight_trend[0] or "Latest", 'positive': weight_trend[1]},
                {'label': 'Muscle Mass', 'value': f"{latest_muscle}%" if latest_muscle is not None else "No data", 'change': 'Target: 45%', 'positive': True},
                {'label': 'Body Fat', 'value': f"{latest_fat}%" if latest_fat is not None else "No data", 'change': fat_trend[0] or "Target: 15%", 'positive': fat_trend[1]},
            ]
        else:
            # Default 'overview' tab
            kpi_metrics = [
                {
                    'id': 'kpi-calories',
                    'title': 'Calories',
                    'value': f"{total_calories:,}",
                    'target': f"{2000 * days:,} kcal",
                    'change': cal_trend[0],
                    'isPositive': cal_trend[1],
                    'comparisonText': cal_trend[2],
                    'type': 'calories',
                    'sparklineData': cal_sparkline,
                },
                {
                    'id': 'kpi-protein',
                    'title': 'Protein',
                    'value': f"{int(total_protein):,}",
                    'target': f"{150 * days:,} g",
                    'change': protein_trend[0],
                    'isPositive': protein_trend[1],
                    'comparisonText': protein_trend[2],
                    'type': 'protein',
                    'sparklineData': protein_sparkline,
                },
                {
                    'id': 'kpi-water',
                    'title': 'Water',
                    'value': str(avg_water),
                    'target': f"{round(3.5 * days, 1)} L",
                    'change': water_trend[0],
                    'isPositive': water_trend[1],
                    'comparisonText': water_trend[2],
                    'type': 'water',
                    'sparklineData': water_sparkline,
                },
                {
                    'id': 'kpi-workouts',
                    'title': 'Workouts',
                    'value': str(total_workouts),
                    'target': f"{max(1, round(days * 0.6))} sessions",
                    'change': workout_trend[0],
                    'isPositive': workout_trend[1],
                    'comparisonText': workout_trend[2],
                    'type': 'workouts',
                    'sparklineData': workout_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Daily Calories', 'value': f"{int(total_calories / avg_days):,} kcal" if has_logs else "0 kcal", 'change': cal_trend[0] or "N/A", 'positive': cal_trend[1]},
                {'label': 'Avg. Daily Protein', 'value': f"{int(total_protein / avg_days)} g" if has_logs else "0 g", 'change': protein_trend[0] or "N/A", 'positive': protein_trend[1]},
                {'label': 'Avg. Daily Water', 'value': f"{avg_water} L" if has_logs else "0.0 L", 'change': water_trend[0] or "N/A", 'positive': water_trend[1]},
                {'label': 'Total Workouts', 'value': f"{total_workouts} sessions", 'change': workout_trend[0] or "N/A", 'positive': workout_trend[1]},
            ]

        calorie_intake_vs_burn = [
            {
                'day': format_day(log.date),
                'intake': log.calories_consumed,
                'burned': log.calories_burned,
            }
            for log in logs
        ]

        # Calculate macro calorie contributions using exact nutritional factors:
        # Protein: 4 kcal/g, Carbohydrates: 4 kcal/g, Fat: 9 kcal/g
        protein_cals = total_protein * 4.0
        carbs_cals = total_carbs * 4.0
        fat_cals = total_fat * 9.0
        total_macro_cals = protein_cals + carbs_cals + fat_cals

        if total_macro_cals > 0:
            carbs_pct = round((carbs_cals / total_macro_cals) * 100)
            protein_pct = round((protein_cals / total_macro_cals) * 100)
            fat_pct = max(0, 100 - (carbs_pct + protein_pct))
        else:
            carbs_pct = 0
            protein_pct = 0
            fat_pct = 0

        macronutrient_distribution = {
            'totalCalories': f"{int(total_macro_cals):,}",
            'items': [
                {
                    'name': 'Carbohydrates',
                    'percentage': carbs_pct,
                    'amount': f"{int(total_carbs // avg_days)}g",
                    'calories': f"{int(carbs_cals // avg_days)} kcal",
                    'color': '#2BAF34'
                },
                {
                    'name': 'Protein',
                    'percentage': protein_pct,
                    'amount': f"{int(total_protein // avg_days)}g",
                    'calories': f"{int(protein_cals // avg_days)} kcal",
                    'color': '#F59E0B'
                },
                {
                    'name': 'Fats',
                    'percentage': fat_pct,
                    'amount': f"{int(total_fat // avg_days)}g",
                    'calories': f"{int(fat_cals // avg_days)} kcal",
                    'color': '#3B82F6'
                },
            ]
        }

        weight_logs = [log for log in logs if log.weight_kg is not None]
        if weight_logs:
            current_weight = float(weight_logs[-1].weight_kg)
            first_weight = float(weight_logs[0].weight_kg)
            diff = round(current_weight - first_weight, 1)
            weight_progress = {
                'currentWeight': f"{current_weight} kg",
                'change': f"{'+' if diff > 0 else ''}{diff} kg",
                'comparison': 'in this period',
                'data': [
                    {
                        'day': format_day(log.date),
                        'weight': float(log.weight_kg)
                    }
                    for log in weight_logs
                ]
            }
        else:
            weight_progress = {
                'currentWeight': None,
                'change': '0 kg',
                'comparison': 'no recorded weight',
                'data': []
            }

        body_composition = [
            {
                'day': format_day(log.date),
                'muscle': float(log.muscle_mass_pct) if log.muscle_mass_pct is not None else 0.0,
                'fat': float(log.body_fat_pct) if log.body_fat_pct is not None else 0.0,
                'water': float(log.water_pct) if log.water_pct is not None else 0.0,
            }
            for log in logs
            if (log.muscle_mass_pct is not None or log.body_fat_pct is not None or log.water_pct is not None)
        ]

        top_days = []
        if has_logs:
            for log in sorted(logs, key=lambda x: (x.workout_sessions_count, x.calories_consumed), reverse=True)[:3]:
                c_score = min(50, int((log.calories_consumed / 2000.0) * 50)) if log.calories_consumed else 0
                w_score = 50 if log.workout_sessions_count > 0 else 0
                daily_pct = min(100, c_score + w_score)
                if daily_pct > 0:
                    top_days.append({
                        'date': format_day_year(log.date),
                        'percentage': daily_pct,
                        'calories': f"{log.calories_consumed:,} kcal",
                        'protein': f"{int(log.protein_g)} g protein",
                        'extra': log.workout_summary or (f"{log.workout_sessions_count} workout session(s)" if log.workout_sessions_count else 'Nutrition logged'),
                    })
        top_performing_days = top_days

        db_improvements = ReportAreaOfImprovement.objects.filter(user=user, is_resolved=False)
        areas_for_improvement = [
            {
                'id': f'imp-{imp.id}',
                'raw_id': imp.id,
                'title': imp.title,
                'description': imp.description,
                'icon': imp.icon
            }
            for imp in db_improvements
        ]

        db_goals = ReportGoal.objects.filter(user=user)
        report_goals = [
            {
                'id': g.id,
                'title': g.title,
                'current': g.current_value,
                'target': g.target_value,
                'percentage': g.percentage,
                'color': g.color
            }
            for g in db_goals
        ]

        db_activities = RecentActivity.objects.filter(user=user)[:5]
        recent_activity = [
            {
                'id': act.id,
                'title': act.title,
                'meta': act.meta,
                'date': format_day_year(act.date),
                'icon': act.icon
            }
            for act in db_activities
        ]

        insight = ReportAIInsight.objects.filter(user=user).first()
        ai_insight = {
            'title': insight.title,
            'headline': insight.headline,
            'description': insight.description,
        } if insight else None

        return {
            'period': period,
            'tab': normalized_tab,
            'date_range': f"{format_day_year(start_date)} - {format_day_year(end_date)}",
            'ai_insight': ai_insight,
            'kpi_metrics': kpi_metrics,
            'calorie_intake_vs_burn': calorie_intake_vs_burn,
            'macronutrient_distribution': macronutrient_distribution,
            'weight_progress': weight_progress,
            'body_composition': body_composition,
            'top_performing_days': top_performing_days,
            'areas_for_improvement': areas_for_improvement,
            'report_summary': report_summary,
            'report_goals': report_goals,
            'recent_activity': recent_activity,
        }
