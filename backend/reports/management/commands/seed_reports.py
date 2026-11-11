from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from reports.models import (
    DailyHealthLog,
    ReportGoal,
    ReportAreaOfImprovement,
    ReportAIInsight,
    RecentActivity,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Development-only: Seeds sample health metrics and logs for a specific demo account'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='ravi@fitnova.com',
            help='Email of the target user account (default: ravi@fitnova.com)'
        )

    def handle(self, *args, **options):
        target_email = options.get('email', 'ravi@fitnova.com')
        self.stdout.write(f"Preparing seed records for user: {target_email}")

        user = User.objects.filter(email=target_email).first()
        if not user:
            user = User.objects.create_user(
                email=target_email,
                first_name='Ravi',
                last_name='Kumar',
                password='Password123!'
            )
            self.stdout.write(self.style.SUCCESS(f"Created account: {target_email}"))

        today = timezone.localdate()

        # Seed 7 days of realistic logs
        sample_logs = [
            {'offset': 6, 'calories': 2100, 'burned': 550, 'protein': 145.0, 'carbs': 210.0, 'fat': 65.0, 'water': 3.5, 'weight': 78.8, 'muscle': 43.5, 'fat_pct': 16.2, 'sleep': 7.5, 'workouts': 1, 'dur': 45, 'summary': 'Upper Body Push'},
            {'offset': 5, 'calories': 2300, 'burned': 650, 'protein': 160.0, 'carbs': 230.0, 'fat': 70.0, 'water': 4.0, 'weight': 78.6, 'muscle': 43.6, 'fat_pct': 16.0, 'sleep': 8.0, 'workouts': 1, 'dur': 60, 'summary': 'Legs & Core'},
            {'offset': 4, 'calories': 1950, 'burned': 400, 'protein': 135.0, 'carbs': 190.0, 'fat': 60.0, 'water': 3.0, 'weight': 78.5, 'muscle': 43.6, 'fat_pct': 15.9, 'sleep': 6.5, 'workouts': 0, 'dur': 0, 'summary': 'Active Recovery'},
            {'offset': 3, 'calories': 2400, 'burned': 700, 'protein': 170.0, 'carbs': 240.0, 'fat': 75.0, 'water': 4.2, 'weight': 78.4, 'muscle': 43.8, 'fat_pct': 15.8, 'sleep': 7.0, 'workouts': 1, 'dur': 55, 'summary': 'Back & Pull'},
            {'offset': 2, 'calories': 2250, 'burned': 600, 'protein': 150.0, 'carbs': 220.0, 'fat': 68.0, 'water': 3.8, 'weight': 78.3, 'muscle': 43.9, 'fat_pct': 15.7, 'sleep': 8.0, 'workouts': 1, 'dur': 50, 'summary': 'HIIT & Shoulders'},
            {'offset': 1, 'calories': 2150, 'burned': 500, 'protein': 140.0, 'carbs': 215.0, 'fat': 64.0, 'water': 3.6, 'weight': 78.2, 'muscle': 44.0, 'fat_pct': 15.6, 'sleep': 7.5, 'workouts': 1, 'dur': 40, 'summary': 'Arms & Abs'},
            {'offset': 0, 'calories': 2350, 'burned': 620, 'protein': 165.0, 'carbs': 225.0, 'fat': 72.0, 'water': 4.1, 'weight': 78.1, 'muscle': 44.1, 'fat_pct': 15.5, 'sleep': 8.0, 'workouts': 1, 'dur': 50, 'summary': 'Full Body Power'},
        ]

        created_logs = 0
        for data in sample_logs:
            log_date = today - timedelta(days=data['offset'])
            _, created = DailyHealthLog.objects.update_or_create(
                user=user,
                date=log_date,
                defaults={
                    'calories_consumed': data['calories'],
                    'calories_burned': data['burned'],
                    'protein_g': data['protein'],
                    'carbs_g': data['carbs'],
                    'fat_g': data['fat'],
                    'water_liters': data['water'],
                    'weight_kg': data['weight'],
                    'muscle_mass_pct': data['muscle'],
                    'body_fat_pct': data['fat_pct'],
                    'water_pct': 58.0,
                    'sleep_hours': data['sleep'],
                    'workout_sessions_count': data['workouts'],
                    'workout_duration_minutes': data['dur'],
                    'workout_summary': data['summary'],
                }
            )
            if created:
                created_logs += 1

        self.stdout.write(f"Updated or created {len(sample_logs)} daily logs for {target_email}.")

        # Report Goals
        goals = [
            ('Calorie Intake Target', '2,150 kcal', '2,300 kcal', 88, '#2BAF34'),
            ('Daily Protein Target', '155 g', '160 g', 92, '#F59E0B'),
            ('Weekly Workout Target', '5 sessions', '6 sessions', 83, '#3B82F6'),
            ('Hydration Goal', '3.8 L', '4.0 L', 95, '#06B6D4'),
        ]
        for title, cur, tgt, pct, col in goals:
            ReportGoal.objects.update_or_create(
                user=user,
                title=title,
                defaults={'current_value': cur, 'target_value': tgt, 'percentage': pct, 'color': col}
            )

        # Improvement Areas
        improvements = [
            ('Hydration on Rest Days', 'Water intake dropped below 3.0L on rest days.', 'water'),
            ('Sleep Consistency', 'Bedtime variance exceeded 90 minutes over the weekend.', 'sleep'),
        ]
        for title, desc, icon in improvements:
            ReportAreaOfImprovement.objects.get_or_create(
                user=user,
                title=title,
                defaults={'description': desc, 'icon': icon, 'is_resolved': False}
            )

        # AI Insight
        ReportAIInsight.objects.update_or_create(
            user=user,
            title='FitNova AI Performance Analysis',
            defaults={
                'headline': 'Outstanding Consistency & Caloric Control',
                'description': 'Your adherence to high-protein nutrition and structured workout splits has driven a 0.7kg reduction in body mass while preserving lean muscle volume.',
                'consistency_rate_pct': 91.5,
                'generated_for_date': today,
            }
        )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded development records for demo user '{target_email}'!"))
