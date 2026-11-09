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

            prev_calories = sum(log.calories_consumed for log in prev_logs)
            prev_burned = sum(log.calories_burned for log in prev_logs)
            prev_protein = sum(float(log.protein_g) for log in prev_logs)
            prev_carbs = sum(float(log.carbs_g) for log in prev_logs)
            prev_fat = sum(float(log.fat_g) for log in prev_logs)
            prev_water = (sum(float(log.water_liters) for log in prev_logs) / len(prev_logs)) if prev_logs.exists() else 0.0
            prev_workouts = sum(log.workout_sessions_count for log in prev_logs)
            prev_duration = sum(log.workout_duration_minutes for log in prev_logs)
            prev_sleep = (sum(float(log.sleep_hours) for log in prev_logs) / len(prev_logs)) if prev_logs.exists() else 0.0

            cal_change = round(((total_calories - prev_calories) / prev_calories) * 100) if prev_calories > 0 else 0
            burned_change = round(((total_burned - prev_burned) / prev_burned) * 100) if prev_burned > 0 else 0
            protein_change = round(((total_protein - prev_protein) / prev_protein) * 100) if prev_protein > 0 else 0
            carbs_change = round(((total_carbs - prev_carbs) / prev_carbs) * 100) if prev_carbs > 0 else 0
            fat_change = round(((total_fat - prev_fat) / prev_fat) * 100) if prev_fat > 0 else 0
            water_change = round(((avg_water - prev_water) / prev_water) * 100) if prev_water > 0 else 0
            workout_change = round(((total_workouts - prev_workouts) / prev_workouts) * 100) if prev_workouts > 0 else 0
            duration_change = round(((total_duration - prev_duration) / prev_duration) * 100) if prev_duration > 0 else 0
            sleep_change = round(((avg_sleep - prev_sleep) / prev_sleep) * 100) if prev_sleep > 0 else 0

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

            cal_change = 0
            burned_change = 0
            protein_change = 0
            carbs_change = 0
            fat_change = 0
            water_change = 0
            workout_change = 0
            duration_change = 0
            sleep_change = 0

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

        # Tab-specific KPI metrics and summary construction
        if normalized_tab == 'nutrition':
            kpi_metrics = [
                {
                    'id': 'kpi-calories',
                    'title': 'Calories In',
                    'value': f"{total_calories:,}",
                    'target': f"{2000 * avg_days:,} kcal",
                    'change': f"{'+' if cal_change > 0 else ''}{cal_change}%",
                    'isPositive': cal_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'calories',
                    'sparklineData': cal_sparkline,
                },
                {
                    'id': 'kpi-protein',
                    'title': 'Protein',
                    'value': f"{int(total_protein):,}g",
                    'target': f"{150 * avg_days:,}g",
                    'change': f"{'+' if protein_change > 0 else ''}{protein_change}%",
                    'isPositive': protein_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'protein',
                    'sparklineData': protein_sparkline,
                },
                {
                    'id': 'kpi-carbs',
                    'title': 'Carbohydrates',
                    'value': f"{int(total_carbs):,}g",
                    'target': f"{220 * avg_days:,}g",
                    'change': f"{'+' if carbs_change > 0 else ''}{carbs_change}%",
                    'isPositive': carbs_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'nutrition',
                    'sparklineData': carbs_sparkline,
                },
                {
                    'id': 'kpi-fat',
                    'title': 'Fats',
                    'value': f"{int(total_fat):,}g",
                    'target': f"{60 * avg_days:,}g",
                    'change': f"{'+' if fat_change > 0 else ''}{fat_change}%",
                    'isPositive': fat_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'nutrition',
                    'sparklineData': fat_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Daily Calories', 'value': f"{int(total_calories / avg_days):,} kcal" if has_logs else "0 kcal", 'change': f"{'+' if cal_change > 0 else ''}{cal_change}%", 'positive': cal_change >= 0},
                {'label': 'Avg. Daily Protein', 'value': f"{int(total_protein / avg_days)} g" if has_logs else "0 g", 'change': f"{'+' if protein_change > 0 else ''}{protein_change}%", 'positive': protein_change >= 0},
                {'label': 'Avg. Daily Carbs', 'value': f"{int(total_carbs / avg_days)} g" if has_logs else "0 g", 'change': f"{'+' if carbs_change > 0 else ''}{carbs_change}%", 'positive': carbs_change >= 0},
                {'label': 'Avg. Daily Fats', 'value': f"{int(total_fat / avg_days)} g" if has_logs else "0 g", 'change': f"{'+' if fat_change > 0 else ''}{fat_change}%", 'positive': fat_change >= 0},
            ]
        elif normalized_tab == 'workouts':
            kpi_metrics = [
                {
                    'id': 'kpi-workouts',
                    'title': 'Total Workouts',
                    'value': f"{total_workouts} sessions",
                    'target': f"{round(days * 0.6)} sessions",
                    'change': f"{'+' if workout_change > 0 else ''}{workout_change}%",
                    'isPositive': workout_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'workouts',
                    'sparklineData': workout_sparkline,
                },
                {
                    'id': 'kpi-duration',
                    'title': 'Total Duration',
                    'value': f"{total_duration} mins",
                    'target': f"{round(days * 35)} mins",
                    'change': f"{'+' if duration_change > 0 else ''}{duration_change}%",
                    'isPositive': duration_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'workouts',
                    'sparklineData': duration_sparkline,
                },
                {
                    'id': 'kpi-burned',
                    'title': 'Calories Burned',
                    'value': f"{total_burned:,} kcal",
                    'target': f"{400 * avg_days:,} kcal",
                    'change': f"{'+' if burned_change > 0 else ''}{burned_change}%",
                    'isPositive': burned_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'calories',
                    'sparklineData': burned_sparkline,
                },
                {
                    'id': 'kpi-avg-session',
                    'title': 'Avg Duration / Workout',
                    'value': f"{int(total_duration / total_workouts) if total_workouts > 0 else 0} mins",
                    'target': '45 mins',
                    'change': '0%',
                    'isPositive': True,
                    'comparisonText': 'per session target',
                    'type': 'workouts',
                    'sparklineData': duration_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Total Workouts', 'value': f"{total_workouts} sessions", 'change': f"{'+' if workout_change > 0 else ''}{workout_change}%", 'positive': workout_change >= 0},
                {'label': 'Total Duration', 'value': f"{total_duration} mins", 'change': f"{'+' if duration_change > 0 else ''}{duration_change}%", 'positive': duration_change >= 0},
                {'label': 'Total Burned', 'value': f"{total_burned:,} kcal", 'change': f"{'+' if burned_change > 0 else ''}{burned_change}%", 'positive': burned_change >= 0},
                {'label': 'Avg Duration', 'value': f"{int(total_duration / total_workouts) if total_workouts > 0 else 0} mins", 'change': '0%', 'positive': True},
            ]
        elif normalized_tab == 'water-intake':
            kpi_metrics = [
                {
                    'id': 'kpi-water-avg',
                    'title': 'Daily Avg Water',
                    'value': f"{avg_water} L",
                    'target': '3.5 L',
                    'change': f"{'+' if water_change > 0 else ''}{water_change}%",
                    'isPositive': water_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'water',
                    'sparklineData': water_sparkline,
                },
                {
                    'id': 'kpi-water-total',
                    'title': 'Total Water',
                    'value': f"{round(total_water, 1)} L",
                    'target': f"{round(days * 3.5, 1)} L",
                    'change': f"{'+' if water_change > 0 else ''}{water_change}%",
                    'isPositive': water_change >= 0,
                    'comparisonText': 'vs period target',
                    'type': 'water',
                    'sparklineData': water_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Daily Water', 'value': f"{avg_water} L" if has_logs else "0.0 L", 'change': f"{'+' if water_change > 0 else ''}{water_change}%", 'positive': water_change >= 0},
                {'label': 'Total Water Intake', 'value': f"{round(total_water, 1)} L" if has_logs else "0.0 L", 'change': f"{'+' if water_change > 0 else ''}{water_change}%", 'positive': water_change >= 0},
            ]
        elif normalized_tab == 'sleep':
            kpi_metrics = [
                {
                    'id': 'kpi-sleep-avg',
                    'title': 'Avg Nightly Sleep',
                    'value': f"{avg_sleep} hrs",
                    'target': '8.0 hrs',
                    'change': f"{'+' if sleep_change > 0 else ''}{sleep_change}%",
                    'isPositive': sleep_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'sleep',
                    'sparklineData': sleep_sparkline,
                },
                {
                    'id': 'kpi-sleep-total',
                    'title': 'Total Sleep Time',
                    'value': f"{round(total_sleep, 1)} hrs",
                    'target': f"{round(days * 8.0, 1)} hrs",
                    'change': f"{'+' if sleep_change > 0 else ''}{sleep_change}%",
                    'isPositive': sleep_change >= 0,
                    'comparisonText': 'period target',
                    'type': 'sleep',
                    'sparklineData': sleep_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Sleep', 'value': f"{avg_sleep} hrs" if has_logs else "0.0 hrs", 'change': f"{'+' if sleep_change > 0 else ''}{sleep_change}%", 'positive': sleep_change >= 0},
                {'label': 'Total Sleep', 'value': f"{round(total_sleep, 1)} hrs" if has_logs else "0.0 hrs", 'change': f"{'+' if sleep_change > 0 else ''}{sleep_change}%", 'positive': sleep_change >= 0},
            ]
        elif normalized_tab == 'supplements':
            active_supplements = UserSupplementStack.objects.filter(user=user, status='Active').count()
            doses_taken = SupplementDailyLog.objects.filter(user=user, date__range=[start_date, end_date], is_taken=True).count()
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
                    'id': 'kpi-supp-active',
                    'title': 'Active Supplements',
                    'value': str(active_supplements),
                    'target': '3 items',
                    'change': '0%',
                    'isPositive': True,
                    'comparisonText': 'in personal stack',
                    'type': 'supplements',
                    'sparklineData': [],
                },
                {
                    'id': 'kpi-supp-taken',
                    'title': 'Doses Taken',
                    'value': str(doses_taken),
                    'target': f"{active_supplements * days} doses",
                    'change': '0%',
                    'isPositive': doses_taken > 0,
                    'comparisonText': 'in this period',
                    'type': 'supplements',
                    'sparklineData': [],
                },
                {
                    'id': 'kpi-supp-streak',
                    'title': 'Adherence Streak',
                    'value': f"{streak_days} days",
                    'target': '14 days',
                    'change': '0%',
                    'isPositive': streak_days > 0,
                    'comparisonText': 'consecutive days',
                    'type': 'supplements',
                    'sparklineData': [],
                },
                {
                    'id': 'kpi-supp-reminders',
                    'title': 'Active Reminders',
                    'value': str(reminders_active),
                    'target': f"{active_supplements} reminders",
                    'change': '0%',
                    'isPositive': True,
                    'comparisonText': 'enabled reminders',
                    'type': 'supplements',
                    'sparklineData': [],
                },
            ]
            report_summary = [
                {'label': 'Active Supplements', 'value': f"{active_supplements} items", 'change': '0%', 'positive': True},
                {'label': 'Doses Taken', 'value': f"{doses_taken} doses", 'change': '0%', 'positive': True},
                {'label': 'Streak Days', 'value': f"{streak_days} days", 'change': '0%', 'positive': streak_days > 0},
                {'label': 'Active Reminders', 'value': f"{reminders_active}", 'change': '0%', 'positive': True},
            ]
        elif normalized_tab == 'body-stats':
            weight_logs = [log for log in logs if log.weight_kg is not None]
            muscle_logs = [log for log in logs if log.muscle_mass_pct is not None]
            fat_logs = [log for log in logs if log.body_fat_pct is not None]
            
            latest_weight = float(weight_logs[-1].weight_kg) if weight_logs else None
            latest_muscle = float(muscle_logs[-1].muscle_mass_pct) if muscle_logs else None
            latest_fat = float(fat_logs[-1].body_fat_pct) if fat_logs else None
            
            kpi_metrics = [
                {
                    'id': 'kpi-weight',
                    'title': 'Current Weight',
                    'value': f"{latest_weight} kg" if latest_weight is not None else "--",
                    'target': '75 kg',
                    'change': '0 kg',
                    'isPositive': True,
                    'comparisonText': 'latest measurement',
                    'type': 'weight',
                    'sparklineData': [float(log.weight_kg) for log in weight_logs][-7:],
                },
                {
                    'id': 'kpi-muscle',
                    'title': 'Muscle Mass',
                    'value': f"{latest_muscle}%" if latest_muscle is not None else "--",
                    'target': '45%',
                    'change': '0%',
                    'isPositive': True,
                    'comparisonText': 'body composition',
                    'type': 'body',
                    'sparklineData': [float(log.muscle_mass_pct) for log in muscle_logs][-7:],
                },
                {
                    'id': 'kpi-body-fat',
                    'title': 'Body Fat',
                    'value': f"{latest_fat}%" if latest_fat is not None else "--",
                    'target': '15%',
                    'change': '0%',
                    'isPositive': True,
                    'comparisonText': 'body composition',
                    'type': 'body',
                    'sparklineData': [float(log.body_fat_pct) for log in fat_logs][-7:],
                },
            ]
            report_summary = [
                {'label': 'Current Weight', 'value': f"{latest_weight} kg" if latest_weight is not None else "No data", 'change': '0%', 'positive': True},
                {'label': 'Muscle Mass', 'value': f"{latest_muscle}%" if latest_muscle is not None else "No data", 'change': '0%', 'positive': True},
                {'label': 'Body Fat', 'value': f"{latest_fat}%" if latest_fat is not None else "No data", 'change': '0%', 'positive': True},
            ]
        else:
            # Default 'overview' tab
            kpi_metrics = [
                {
                    'id': 'kpi-calories',
                    'title': 'Calories',
                    'value': f"{total_calories:,}",
                    'target': '15,400 kcal',
                    'change': f"{'+' if cal_change > 0 else ''}{cal_change}%",
                    'isPositive': cal_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'calories',
                    'sparklineData': cal_sparkline,
                },
                {
                    'id': 'kpi-protein',
                    'title': 'Protein',
                    'value': f"{int(total_protein):,}",
                    'target': '1,050 g',
                    'change': f"{'+' if protein_change > 0 else ''}{protein_change}%",
                    'isPositive': protein_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'protein',
                    'sparklineData': protein_sparkline,
                },
                {
                    'id': 'kpi-water',
                    'title': 'Water',
                    'value': str(avg_water),
                    'target': '4 L',
                    'change': f"{'+' if water_change > 0 else ''}{water_change}%",
                    'isPositive': water_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'water',
                    'sparklineData': water_sparkline,
                },
                {
                    'id': 'kpi-workouts',
                    'title': 'Workouts',
                    'value': str(total_workouts),
                    'target': '8 sessions',
                    'change': f"{'+' if workout_change > 0 else ''}{workout_change}%",
                    'isPositive': workout_change >= 0,
                    'comparisonText': 'vs previous period',
                    'type': 'workouts',
                    'sparklineData': workout_sparkline,
                },
            ]
            report_summary = [
                {'label': 'Avg. Daily Calories', 'value': f"{int(total_calories / avg_days):,} kcal" if has_logs else "0 kcal", 'change': f"{'+' if cal_change > 0 else ''}{cal_change}%", 'positive': cal_change >= 0},
                {'label': 'Avg. Daily Protein', 'value': f"{int(total_protein / avg_days)} g" if has_logs else "0 g", 'change': f"{'+' if protein_change > 0 else ''}{protein_change}%", 'positive': protein_change >= 0},
                {'label': 'Avg. Daily Water', 'value': f"{avg_water} L" if has_logs else "0.0 L", 'change': f"{'+' if water_change > 0 else ''}{water_change}%", 'positive': water_change >= 0},
                {'label': 'Total Workouts', 'value': f"{total_workouts} sessions", 'change': f"{'+' if workout_change > 0 else ''}{workout_change}%", 'positive': workout_change >= 0},
            ]

        calorie_intake_vs_burn = [
            {
                'day': format_day(log.date),
                'intake': log.calories_consumed,
                'burned': log.calories_burned,
            }
            for log in logs
        ]

        total_macro_g = total_carbs + total_protein + total_fat
        if total_macro_g > 0:
            carbs_pct = round((total_carbs / total_macro_g) * 100)
            protein_pct = round((total_protein / total_macro_g) * 100)
            fat_pct = max(0, 100 - (carbs_pct + protein_pct))
        else:
            carbs_pct = 0
            protein_pct = 0
            fat_pct = 0

        macronutrient_distribution = {
            'totalCalories': f"{total_calories:,}",
            'items': [
                {'name': 'Carbohydrates', 'percentage': carbs_pct, 'amount': f"{int(total_carbs // avg_days)}g", 'color': '#2BAF34'},
                {'name': 'Protein', 'percentage': protein_pct, 'amount': f"{int(total_protein // avg_days)}g", 'color': '#F59E0B'},
                {'name': 'Fats', 'percentage': fat_pct, 'amount': f"{int(total_fat // avg_days)}g", 'color': '#3B82F6'},
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
