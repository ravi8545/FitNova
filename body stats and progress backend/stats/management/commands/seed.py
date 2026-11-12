from datetime import date

from django.core.management.base import BaseCommand

from stats.models import (
    Goal,
    Measurement,
    Milestone,
    ProgressPhoto,
    WorkoutLog,
)


class Command(BaseCommand):
    help = "Seed the database with the FitNova sample data used by the frontend."

    def handle(self, *args, **options):
        Measurement.objects.all().delete()
        Goal.objects.all().delete()
        Milestone.objects.all().delete()
        ProgressPhoto.objects.all().delete()
        WorkoutLog.objects.all().delete()

        # Measurements spanning ~3 months so 7d / 30d / 90d windows differ.
        # date, weight, fat, muscle, bmi, chest, waist, arms, steps
        measurements = [
            (date(2025, 3, 15), 87.2, 25.0, 58.5, 26.9, 97, 86, 31, 6000),
            (date(2025, 3, 25), 86.5, 24.6, 58.9, 26.7, 97, 85, 31, 6300),
            (date(2025, 4, 5), 85.8, 24.2, 59.2, 26.5, 96, 85, 31, 6600),
            (date(2025, 4, 15), 85.1, 23.6, 59.5, 26.3, 96, 84, 32, 6900),
            (date(2025, 4, 25), 84.5, 23.0, 59.8, 26.1, 96, 83, 32, 7100),
            (date(2025, 5, 12), 85.1, 22.4, 60.0, 26.3, 96, 83, 32, 7200),
            (date(2025, 5, 25), 84.0, 21.5, 60.7, 25.9, 95, 81, 32, 7800),
            (date(2025, 6, 1), 83.0, 20.8, 61.2, 25.6, 95, 80, 33, 8100),
            (date(2025, 6, 6), 82.9, 20.4, 61.4, 25.6, 94, 79, 33, 8300),
            (date(2025, 6, 10), 82.4, 20.0, 61.8, 25.4, 94, 78, 33, 8500),
        ]
        for d, w, f, m, b, c, wa, a, s in measurements:
            Measurement.objects.create(
                date=d, weight=w, body_fat=f, muscle=m, bmi=b,
                chest=c, waist=wa, arms=a, steps=s,
            )

        # Workout logs: volume (sets) for strength, pace + distance for cardio.
        # The late-May/early-June block is a run of consecutive days so the
        # "Longest Workout Streak" stat computes to a realistic number.
        # date, volume, pace(min/km), distance(km)
        workouts = [
            (date(2025, 3, 15), 90, 7.0, 2.0),
            (date(2025, 3, 25), 110, 6.9, 3.0),
            (date(2025, 4, 5), 150, 6.7, 3.5),
            (date(2025, 4, 15), 170, 6.5, 4.0),
            (date(2025, 4, 25), 200, 6.3, 4.5),
            (date(2025, 5, 12), 150, 6.3, 4.5),
            (date(2025, 5, 25), 190, 6.1, 5.5),
            # Consecutive-day streak (May 28 - Jun 6 = 10 days)
            (date(2025, 5, 28), 180, 6.0, 5.0),
            (date(2025, 5, 29), 195, 6.0, 5.2),
            (date(2025, 5, 30), 205, 5.9, 5.4),
            (date(2025, 5, 31), 200, 5.9, 5.6),
            (date(2025, 6, 1), 210, 5.9, 6.0),
            (date(2025, 6, 2), 220, 5.9, 6.1),
            (date(2025, 6, 3), 215, 5.8, 6.2),
            (date(2025, 6, 4), 230, 5.8, 6.3),
            (date(2025, 6, 5), 250, 5.8, 6.4),
            (date(2025, 6, 6), 260, 5.8, 6.5),
            (date(2025, 6, 10), 240, 5.7, 7.2),
        ]
        for d, vol, pace, dist in workouts:
            WorkoutLog.objects.create(date=d, volume=vol, pace=pace, distance=dist)

        goals = [
            ("weight", "Current Weight", 85.6, 75, "kg", "#22c55e"),
            ("fat", "Body Fat", 24, 15, "%", "#2d7ff9"),
            ("muscle", "Muscle Mass", 59.2, 65, "kg", "#8b45e8"),
            ("bmi", "BMI", 26.4, 23, "", "#f5a524"),
        ]
        for key, label, start, goal, unit, color in goals:
            Goal.objects.create(
                key=key, label=label, start=start, goal=goal, unit=unit, color=color
            )

        milestones = [
            ("Ran 5k in <25 mins!", "Jun 8", True, True),
            ("30-Day Workout Streak Logged", "Jun 1", False, False),
            ("Halfway to Weight Goal", "May 22", False, False),
            ("New Bench PR +5 kg", "May 15", False, True),
            ("Journey Started", "May 1", False, False),
        ]
        for title, d, done, pr in milestones:
            Milestone.objects.create(title=title, date=d, done=done, pr=pr)

        photos = [
            ("Week 1", 85.6, "01 Mar 2025", "Progress"),
            ("Week 2", 84.3, "15 Mar 2025", "Progress"),
            ("Week 3", 83.1, "01 Apr 2025", "Progress"),
            ("Week 4", 82.4, "15 Apr 2025", "Front View"),
            ("Week 5", 82.4, "01 May 2025", "Side View"),
        ]
        for label, weight, d, category in photos:
            ProgressPhoto.objects.create(
                label=label, weight=weight, date=d, category=category
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {Measurement.objects.count()} measurements, "
            f"{WorkoutLog.objects.count()} workouts, "
            f"{Goal.objects.count()} goals, "
            f"{Milestone.objects.count()} milestones, "
            f"{ProgressPhoto.objects.count()} photos."
        ))
