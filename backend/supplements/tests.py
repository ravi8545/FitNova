from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from supplements.models import (
    SupplementCategory,
    SupplementProduct,
    UserSupplementStack,
    SupplementReminder,
    SupplementDailyLog,
    SupplementWishlist,
    SupplementCartItem,
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


class SupplementAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_test_user('test@fitnova.com', 'TestPassword123!')
        self.other_user = make_test_user('other@fitnova.com', 'TestPassword123!')
        self.staff_user = make_test_user('staff@fitnova.com', 'TestPassword123!', is_staff=True)
        self.client.force_authenticate(user=self.user)

        self.category = SupplementCategory.objects.create(
            name='Proteins',
            slug='proteins',
            icon_url='https://example.com/icon.png'
        )

        self.product = SupplementProduct.objects.create(
            name='Gold Standard 100% Whey',
            brand='Optimum Nutrition',
            category=self.category,
            price=54.99,
            rating=4.8,
            reviews_count='2340',
            in_stock=True
        )

    def test_list_categories_and_products_public(self):
        # Unauthenticated client can browse
        anon_client = APIClient()
        cat_res = anon_client.get('/api/supplements/categories/')
        self.assertEqual(cat_res.status_code, status.HTTP_200_OK)
        prod_res = anon_client.get('/api/supplements/products/')
        self.assertEqual(prod_res.status_code, status.HTTP_200_OK)

    def test_catalogue_permissions_regular_user_cannot_modify(self):
        # Regular authenticated user cannot create a catalogue product
        res = self.client.post('/api/supplements/products/', {
            'name': 'Hacked Product',
            'brand': 'Hacker',
            'price': 10.00
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_catalogue_permissions_staff_can_create(self):
        self.client.force_authenticate(user=self.staff_user)
        res = self.client.post('/api/supplements/products/', {
            'name': 'Admin Added Product',
            'brand': 'FitNova Official',
            'price': 29.99,
            'category': self.category.id,
            'in_stock': True
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_user_stack_crud_and_status_filtering(self):
        # Create custom supplement
        res_create = self.client.post('/api/supplements/stack/', {
            'name': 'Creatine Monohydrate',
            'category': 'Creatine',
            'timing': 'Pre Workout',
            'dosage': '5g',
            'status': 'Active'
        }, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        stack_id = res_create.data['id']

        # Create second supplement paused
        self.client.post('/api/supplements/stack/', {
            'name': 'Omega 3 Fish Oil',
            'category': 'Omega 3',
            'timing': 'With Water Daily',
            'dosage': '1 capsule',
            'status': 'Paused'
        }, format='json')

        # Filter active
        res_active = self.client.get('/api/supplements/stack/?status=Active')
        items = res_active.data.get('results', res_active.data) if isinstance(res_active.data, dict) else res_active.data
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['name'], 'Creatine Monohydrate')

        # Update dosage and status
        res_update = self.client.patch(f'/api/supplements/stack/{stack_id}/', {
            'dosage': '10g',
            'status': 'Completed'
        }, format='json')
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update.data['dosage'], '10g')
        self.assertEqual(res_update.data['status'], 'Completed')

        # Delete
        res_del = self.client.delete(f'/api/supplements/stack/{stack_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_isolation(self):
        # User creates an item
        res = self.client.post('/api/supplements/stack/', {
            'name': 'User Private Stack',
            'dosage': '1 scoop'
        })
        stack_id = res.data['id']

        # Other user tries to access or delete it
        other_client = APIClient()
        other_client.force_authenticate(user=self.other_user)
        get_res = other_client.get(f'/api/supplements/stack/{stack_id}/')
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

        del_res = other_client.delete(f'/api/supplements/stack/{stack_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_404_NOT_FOUND)

    def test_reminder_toggle(self):
        reminder = SupplementReminder.objects.create(
            user=self.user,
            name='Whey Protein Post-Workout',
            dose='1 Scoop',
            time='08:30 AM',
            is_enabled=True
        )
        toggle_res = self.client.post(f'/api/supplements/reminders/{reminder.id}/toggle/')
        self.assertEqual(toggle_res.status_code, status.HTTP_200_OK)
        reminder.refresh_from_db()
        self.assertFalse(reminder.is_enabled)

    def test_wishlist_prevent_duplicates(self):
        # Add to wishlist
        res1 = self.client.post('/api/supplements/wishlist/', {'product': self.product.id})
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Duplicate should return 400
        res2 = self.client.post('/api/supplements/wishlist/', {'product': self.product.id})
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cart_operations_and_clear(self):
        # Add to cart
        res1 = self.client.post('/api/supplements/cart/', {'product': self.product.id, 'quantity': 1})
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Add again should increment quantity to 2
        res2 = self.client.post('/api/supplements/cart/', {'product': self.product.id, 'quantity': 2})
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data['quantity'], 3)

        # Clear cart
        clear_res = self.client.delete('/api/supplements/cart/clear/')
        self.assertEqual(clear_res.status_code, status.HTTP_200_OK)
        self.assertEqual(SupplementCartItem.objects.filter(user=self.user).count(), 0)

    def test_supplement_overview_real_values(self):
        # Initial empty overview should return exact 0s, not fake 4, 2, 3 or 12
        ov_res = self.client.get('/api/supplements/overview/')
        self.assertEqual(ov_res.status_code, status.HTTP_200_OK)
        ov = ov_res.data['overview']
        self.assertEqual(ov['activeCount'], 0)
        self.assertEqual(ov['completedCount'], 0)
        self.assertEqual(ov['streakDays'], 0)
        self.assertEqual(ov['remindersCount'], 0)

        # Add 1 active stack and 1 reminder and 1 daily log
        stack = UserSupplementStack.objects.create(
            user=self.user,
            name='Daily Vitamin',
            dosage='1 pill',
            status='Active'
        )
        SupplementReminder.objects.create(
            user=self.user,
            stack_item=stack,
            name='Daily Reminder',
            dose='1 pill',
            time='10:00 AM',
            is_enabled=True
        )
        SupplementDailyLog.objects.create(
            user=self.user,
            stack_item=stack,
            date=timezone.localdate(),
            is_taken=True
        )

        ov_res2 = self.client.get('/api/supplements/overview/')
        ov2 = ov_res2.data['overview']
        self.assertEqual(ov2['activeCount'], 1)
        self.assertEqual(ov2['remindersCount'], 1)
        self.assertEqual(ov2['streakDays'], 1)
