from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from progress.models import ProgressMilestone, ProgressPhoto, WorkoutLog
from stats.models import BodyMeasurement

User = get_user_model()


class ProgressApiTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="runner1@fitnova.com",
            first_name="Runner1",
            password="StrongPassword123!",
        )
        self.user2 = User.objects.create_user(
            email="runner2@fitnova.com",
            first_name="Runner2",
            password="StrongPassword123!",
        )
        self.client.force_authenticate(user=self.user1)

    def test_unauthenticated_request_rejected(self):
        self.client.logout()
        res = self.client.get(reverse("progress-overview"))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_milestone_crud_and_isolation(self):
        # Create milestone for user 1
        url = reverse("milestone-list")
        payload = {
            "title": "Ran 10k under 50 min",
            "date": "2025-06-05",
            "done": True,
            "pr": True,
            "category": "Cardio",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        milestone_id = res.data["id"]

        # User 2 cannot access user 1's milestone
        self.client.force_authenticate(user=self.user2)
        res_user2 = self.client.get(reverse("milestone-detail", kwargs={"pk": milestone_id}))
        self.assertEqual(res_user2.status_code, status.HTTP_404_NOT_FOUND)

    def test_workout_streak_and_pr_calculation(self):
        # 3 consecutive days for user 1
        d1 = date(2025, 6, 1)
        d2 = date(2025, 6, 2)
        d3 = date(2025, 6, 3)

        WorkoutLog.objects.create(user=self.user1, date=d1, volume=120, distance=Decimal("5.0"), pace=Decimal("5.5"))
        WorkoutLog.objects.create(user=self.user1, date=d2, volume=150, distance=Decimal("6.0"), pace=Decimal("5.4"))
        WorkoutLog.objects.create(user=self.user1, date=d3, volume=180, distance=Decimal("7.0"), pace=Decimal("5.3"))

        # Milestones
        ProgressMilestone.objects.create(user=self.user1, title="PR 1", date=d1, done=True, pr=True)
        ProgressMilestone.objects.create(user=self.user1, title="PR 2", date=d2, done=True, pr=True)

        res = self.client.get(reverse("progress-overview"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        stats_map = {s["key"]: s["value"] for s in res.data["stats"]}
        self.assertEqual(stats_map["pr"], "2 New")
        self.assertEqual(stats_map["streak"], "3 Days")

    def test_progress_trends_view(self):
        d1 = date(2025, 6, 1)
        BodyMeasurement.objects.create(user=self.user1, date=d1, weight=Decimal("82.0"))
        WorkoutLog.objects.create(user=self.user1, date=d1, volume=120, distance=Decimal("5.0"), pace=Decimal("5.5"))

        res = self.client.get(reverse("progress-trends"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("strength", res.data)
        self.assertIn("cardio", res.data)
        self.assertIn("30d", res.data["strength"])
        self.assertIn("30d", res.data["cardio"])

    def test_achievements_endpoint(self):
        res = self.client.get(reverse("progress-achievements"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(res.data, list))
        badge_ids = [b["id"] for b in res.data]
        self.assertIn("first_step", badge_ids)
