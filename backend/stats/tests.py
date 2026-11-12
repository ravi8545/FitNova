from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from profiles.models import Profile
from stats.models import BodyGoal, BodyMeasurement

User = get_user_model()


class BodyStatsApiTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="athlete1@fitnova.com",
            first_name="Athlete1",
            password="StrongPassword123!",
        )
        self.user2 = User.objects.create_user(
            email="athlete2@fitnova.com",
            first_name="Athlete2",
            password="StrongPassword123!",
        )

        # Profile with height 180cm for user1 to test BMI calculation
        self.profile1 = Profile.objects.create(
            user=self.user1,
            date_of_birth="1995-05-15",
            gender="male",
            height=Decimal("180.0"),
            current_weight=Decimal("80.0"),
            target_weight=Decimal("75.0"),
            fitness_goal="weight_loss",
            activity_level="moderate",
        )

        self.client.force_authenticate(user=self.user1)

    def test_unauthenticated_request_rejected(self):
        self.client.logout()
        res = self.client.get(reverse("stats-overview"))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_measurement_and_bmi_auto_calc(self):
        url = reverse("measurement-list")
        payload = {
            "date": "2025-06-01",
            "weight": 81.0,
            "body_fat": 18.5,
            "muscle": 60.0,
            "chest": 98.0,
            "waist": 82.0,
            "arms": 34.0,
            "steps": 9000,
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(res.data["weight"]), 81.0)
        # BMI for 81 kg and 1.80m = 81 / (1.8^2) = 25.0
        self.assertEqual(float(res.data["bmi"]), 25.0)

        # Verify in DB
        m = BodyMeasurement.objects.get(id=res.data["id"])
        self.assertEqual(m.user, self.user1)
        self.assertEqual(float(m.bmi), 25.0)

    def test_measurement_validation_future_date(self):
        url = reverse("measurement-list")
        tomorrow = date.today() + timedelta(days=2)
        payload = {
            "date": tomorrow.isoformat(),
            "weight": 80.0,
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", res.data)

    def test_measurement_validation_invalid_weight(self):
        url = reverse("measurement-list")
        payload = {
            "date": "2025-06-02",
            "weight": -5.0,
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("weight", res.data)

    def test_user_data_isolation(self):
        # Create measurement for user 2
        m2 = BodyMeasurement.objects.create(
            user=self.user2,
            date="2025-06-01",
            weight=Decimal("95.0"),
        )

        # User 1 should not see it in list
        res = self.client.get(reverse("measurement-list"))
        ids = [item["id"] for item in res.data]
        self.assertNotIn(m2.id, ids)

        # User 1 cannot access user 2's measurement detail
        detail_url = reverse("measurement-detail", kwargs={"pk": m2.id})
        res_detail = self.client.get(detail_url)
        self.assertEqual(res_detail.status_code, status.HTTP_404_NOT_FOUND)

    def test_stats_overview_payload_shape(self):
        # Create measurements
        BodyMeasurement.objects.create(
            user=self.user1,
            date="2025-06-01",
            weight=Decimal("82.0"),
            body_fat=Decimal("20.0"),
            muscle=Decimal("59.0"),
            bmi=Decimal("25.3"),
        )
        BodyMeasurement.objects.create(
            user=self.user1,
            date="2025-06-10",
            weight=Decimal("80.5"),
            body_fat=Decimal("19.5"),
            muscle=Decimal("59.5"),
            bmi=Decimal("24.8"),
        )

        # Goal
        BodyGoal.objects.create(
            user=self.user1,
            key="weight",
            label="Current Weight",
            start=Decimal("85.0"),
            goal=Decimal("75.0"),
            unit="kg",
        )

        res = self.client.get(reverse("stats-overview"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("stats", res.data)
        self.assertIn("trend", res.data)
        self.assertIn("composition", res.data)
        self.assertIn("summary", res.data)
        self.assertIn("recent", res.data)
        self.assertEqual(len(res.data["recent"]), 2)
        # Latest weight should be 80.5
        self.assertEqual(res.data["recent"][0]["weight"], 80.5)
