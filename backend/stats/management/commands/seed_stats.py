from datetime import date
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from progress.models import ProgressMilestone, ProgressPhoto, WorkoutLog
from stats.models import BodyGoal, BodyMeasurement

User = get_user_model()


class Command(BaseCommand):
    help = "Seed body stats and progress data for users."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Target user email to seed data for. Defaults to all existing users if omitted.",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        if email:
            users = User.objects.filter(email=email)
            if not users.exists():
                self.stderr.write(f"User with email '{email}' not found.")
                return
        else:
            users = User.objects.all()
            if not users.exists():
                self.stderr.write("No users found in database.")
                return

        for user in users:
            self.stdout.write(f"Seeding stats and progress data for: {user.email}")

            # Clear old records for this user
            BodyMeasurement.objects.filter(user=user).delete()
            BodyGoal.objects.filter(user=user).delete()
            ProgressMilestone.objects.filter(user=user).delete()
            ProgressPhoto.objects.filter(user=user).delete()
            WorkoutLog.objects.filter(user=user).delete()

            # Measurements spanning 3 months
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
                BodyMeasurement.objects.create(
                    user=user,
                    date=d,
                    weight=w,
                    body_fat=f,
                    muscle=m,
                    bmi=b,
                    chest=c,
                    waist=wa,
                    arms=a,
                    steps=s,
                )

            # Goals
            goals = [
                ("weight", "Current Weight", 85.6, 75, "kg", "#22c55e"),
                ("fat", "Body Fat", 24, 15, "%", "#2d7ff9"),
                ("muscle", "Muscle Mass", 59.2, 65, "kg", "#8b45e8"),
                ("bmi", "BMI", 26.4, 23, "", "#f5a524"),
            ]
            for key, label, start, goal, unit, color in goals:
                BodyGoal.objects.create(
                    user=user,
                    key=key,
                    label=label,
                    start=start,
                    goal=goal,
                    unit=unit,
                    color=color,
                )

            # Milestones
            milestones = [
                ("Ran 5k in <25 mins!", date(2025, 6, 8), "Jun 8", True, True, "Cardio"),
                ("30-Day Workout Streak Logged", date(2025, 6, 1), "Jun 1", False, False, "Consistency"),
                ("Halfway to Weight Goal", date(2025, 5, 22), "May 22", False, False, "Body Composition"),
                ("New Bench PR +5 kg", date(2025, 5, 15), "May 15", False, True, "Strength"),
                ("Journey Started", date(2025, 5, 1), "May 1", False, False, "Getting Started"),
            ]
            for title, d, disp, done, pr, cat in milestones:
                ProgressMilestone.objects.create(
                    user=user,
                    title=title,
                    date=d,
                    display_date=disp,
                    done=done,
                    pr=pr,
                    category=cat,
                )

            # Photos
            photos = [
                ("Week 1", 85.6, date(2025, 3, 1), "01 Mar 2025", "Progress", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80"),
                ("Week 2", 84.3, date(2025, 3, 15), "15 Mar 2025", "Progress", "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80"),
                ("Week 3", 83.1, date(2025, 4, 1), "01 Apr 2025", "Progress", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"),
                ("Week 4", 82.4, date(2025, 4, 15), "15 Apr 2025", "Front View", "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80"),
                ("Week 5", 82.4, date(2025, 5, 1), "01 May 2025", "Side View", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"),
            ]
            for label, weight, d, disp, category, src in photos:
                ProgressPhoto.objects.create(
                    user=user,
                    label=label,
                    weight=weight,
                    date=d,
                    display_date=disp,
                    category=category,
                    src=src,
                )

            # Workouts
            workouts = [
                (date(2025, 3, 15), 90, 7.0, 2.0),
                (date(2025, 3, 25), 110, 6.9, 3.0),
                (date(2025, 4, 5), 150, 6.7, 3.5),
                (date(2025, 4, 15), 170, 6.5, 4.0),
                (date(2025, 4, 25), 200, 6.3, 4.5),
                (date(2025, 5, 12), 150, 6.3, 4.5),
                (date(2025, 5, 25), 190, 6.1, 5.5),
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
                WorkoutLog.objects.create(
                    user=user,
                    date=d,
                    volume=vol,
                    pace=pace,
                    distance=dist,
                )

        self.stdout.write(self.style.SUCCESS("Stats and Progress data successfully seeded!"))

