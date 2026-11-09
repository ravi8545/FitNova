from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from reports.models import (
    DailyHealthLog,
    ReportGoal,
    ReportAreaOfImprovement,
    ReportAIInsight,
)
from supplements.models import (
    UserSupplementStack,
    SupplementDailyLog,
)

User = get_user_model()


def make_test_user(email, password, is_staff=False, **kwargs):
    fields = [f.name for f in User._meta.get_fields()]
    user_kwargs = {'email': email, 'password': password}
    if 'username' in fields:
        user_kwargs['username'] = kwargs.get('username', email.split('@')[0])
    if 'first_name' in fields:
        user_kwargs['first_name'] = kwargs.get('first_name', 'Test')
    if is_staff:
        user_kwargs['is_staff'] = True
    return User.objects.create_user(**user_kwargs)


class ReportsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_test_user('report_test@fitnova.com', 'TestPassword123!')
        self.other_user = make_test_user('other_report@fitnova.com', 'TestPassword123!')
        self.client.force_authenticate(user=self.user)

    def test_analytics_report_clean_zeros_when_no_logs(self):
        response = self.client.get('/api/reports/analytics/?period=7d')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(DailyHealthLog.objects.filter(user=self.user).count(), 0)

        # Check KPI values
        kpis = {k['title']: k['value'] for k in response.data['kpi_metrics']}
        self.assertEqual(kpis['Calories'], '0')
        self.assertEqual(kpis['Protein'], '0')
        self.assertEqual(kpis['Water'], '0.0')
        self.assertEqual(kpis['Workouts'], '0')

        # Check empty arrays
        self.assertEqual(response.data['calorie_intake_vs_burn'], [])
        self.assertEqual(response.data['weight_progress']['data'], [])
        self.assertIsNone(response.data['weight_progress']['currentWeight'])
        self.assertEqual(response.data['top_performing_days'], [])

    def test_analytics_report_with_real_logs(self):
        today = timezone.localdate()
        DailyHealthLog.objects.create(
            user=self.user,
            date=today,
            calories_consumed=2200,
            calories_burned=1800,
            protein_g=140.0,
            carbs_g=200.0,
            fat_g=60.0,
            water_liters=3.5,
            weight_kg=78.5,
            workout_sessions_count=1,
            workout_summary='Legs and Abs'
        )

        response = self.client.get('/api/reports/analytics/?period=7d')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        kpis = {k['title']: k['value'] for k in response.data['kpi_metrics']}
        self.assertEqual(kpis['Calories'], '2,200')
        self.assertEqual(kpis['Protein'], '140')
        self.assertEqual(kpis['Water'], '3.5')
        self.assertEqual(kpis['Workouts'], '1')

        self.assertEqual(len(response.data['calorie_intake_vs_burn']), 1)
        self.assertEqual(response.data['calorie_intake_vs_burn'][0]['intake'], 2200)
        self.assertEqual(response.data['weight_progress']['currentWeight'], '78.5 kg')
        self.assertEqual(len(response.data['top_performing_days']), 1)
        self.assertEqual(response.data['top_performing_days'][0]['extra'], 'Legs and Abs')

    def test_all_supported_periods(self):
        for period in ['7d', '30d', '3m', '1y']:
            res = self.client.get(f'/api/reports/analytics/?period={period}')
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data['period'], period)

    def test_tab_specific_analytics(self):
        today = timezone.localdate()
        DailyHealthLog.objects.create(
            user=self.user,
            date=today,
            calories_consumed=2500,
            calories_burned=600,
            protein_g=160.0,
            carbs_g=250.0,
            fat_g=70.0,
            water_liters=4.0,
            workout_sessions_count=2,
            workout_duration_minutes=90,
            sleep_hours=7.5,
            weight_kg=80.0
        )

        # Nutrition tab
        res_nut = self.client.get('/api/reports/analytics/?period=7d&tab=nutrition')
        self.assertEqual(res_nut.status_code, status.HTTP_200_OK)
        nut_titles = [k['title'] for k in res_nut.data['kpi_metrics']]
        self.assertIn('Protein', nut_titles)
        self.assertIn('Carbohydrates', nut_titles)

        # Workouts tab
        res_work = self.client.get('/api/reports/analytics/?period=7d&tab=workouts')
        self.assertEqual(res_work.status_code, status.HTTP_200_OK)
        work_titles = [k['title'] for k in res_work.data['kpi_metrics']]
        self.assertIn('Total Workouts', work_titles)
        self.assertIn('Total Duration', work_titles)

        # Water tab
        res_water = self.client.get('/api/reports/analytics/?period=7d&tab=water-intake')
        self.assertEqual(res_water.status_code, status.HTTP_200_OK)
        self.assertIn('Daily Avg Water', [k['title'] for k in res_water.data['kpi_metrics']])

        # Sleep tab
        res_sleep = self.client.get('/api/reports/analytics/?period=7d&tab=sleep')
        self.assertEqual(res_sleep.status_code, status.HTTP_200_OK)
        self.assertIn('Avg Nightly Sleep', [k['title'] for k in res_sleep.data['kpi_metrics']])

        # Supplements tab
        res_supp = self.client.get('/api/reports/analytics/?period=7d&tab=supplements')
        self.assertEqual(res_supp.status_code, status.HTTP_200_OK)
        self.assertIn('Active Supplements', [k['title'] for k in res_supp.data['kpi_metrics']])

    def test_invalid_period_returns_400(self):
        response = self.client.get('/api/reports/analytics/?period=99d')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_daily_health_log_update_or_create(self):
        today = timezone.localdate().isoformat()
        res1 = self.client.post('/api/reports/logs/', {
            'date': today,
            'calories_consumed': 2000,
            'calories_burned': 1500,
            'protein_g': 120.0,
        })
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        res2 = self.client.post('/api/reports/logs/', {
            'date': today,
            'calories_consumed': 2500,
            'calories_burned': 1800,
            'protein_g': 150.0,
        })
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(DailyHealthLog.objects.filter(user=self.user, date=today).count(), 1)
        self.assertEqual(DailyHealthLog.objects.get(user=self.user, date=today).calories_consumed, 2500)

    def test_improvement_resolve_action(self):
        imp = ReportAreaOfImprovement.objects.create(
            user=self.user,
            title='Drink More Water',
            description='Aim for 3.5L daily',
            icon='water',
            is_resolved=False
        )
        res = self.client.post(f'/api/reports/improvements/{imp.id}/resolve/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        imp.refresh_from_db()
        self.assertTrue(imp.is_resolved)

    def test_user_data_isolation(self):
        log = DailyHealthLog.objects.create(
            user=self.user,
            calories_consumed=3000
        )
        other_client = APIClient()
        other_client.force_authenticate(user=self.other_user)
        res = other_client.get(f'/api/reports/logs/{log.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
