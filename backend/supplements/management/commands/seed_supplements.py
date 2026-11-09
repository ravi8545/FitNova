from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from supplements.models import (
    SupplementCategory,
    SupplementProduct,
    SupplementArticle,
    UserSupplementStack,
    SupplementReminder,
    SupplementGoal,
    SupplementDailyLog,
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial supplement categories, products, articles, stack and reminders'

    def handle(self, *args, **options):
        # 1. Ensure demo user exists
        demo_user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'email': 'demo@fitnova.com',
                'first_name': 'Demo',
                'last_name': 'Athlete',
            }
        )
        demo_user.set_password('Password123!')
        demo_user.save()

        # 2. Categories
        categories_data = [
            ('protein', 'Protein', 'Build & repair muscle', 1),
            ('creatine', 'Creatine', 'Strength & performance', 2),
            ('pre-workout', 'Pre-Workout', 'Energy & focus', 3),
            ('vitamins', 'Vitamins', 'Overall wellness', 4),
            ('amino-acids', 'Amino Acids', 'Recovery & endurance', 5),
            ('fat-burners', 'Fat Burners', 'Support metabolism', 6),
            ('post-workout', 'Post-Workout', 'Faster recovery', 7),
            ('misc', 'Miscellaneous', 'Other supplements', 8),
        ]

        cat_map = {}
        for slug, name, desc, order in categories_data:
            cat, _ = SupplementCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc, 'display_order': order}
            )
            cat_map[slug] = cat

        # 3. Products
        products = [
            {
                'name': 'Optimum Nutrition Gold Standard Whey Protein',
                'slug': 'optimum-nutrition-gold-standard-whey',
                'category': cat_map.get('protein'),
                'brand': 'Optimum Nutrition',
                'badge_text': 'Best Seller',
                'badge_color': 'bg-[#2BAF34] text-black font-semibold',
                'rating': 4.8,
                'reviews_count': '12.4k',
                'price': 5499,
                'original_price': 6999,
                'is_featured': True,
                'description': 'The world’s best-selling whey protein powder for rapid muscle recovery and muscle building.'
            },
            {
                'name': 'MuscleBlaze Creatine Monohydrate',
                'slug': 'muscleblaze-creatine-monohydrate',
                'category': cat_map.get('creatine'),
                'brand': 'MuscleBlaze',
                'badge_text': 'Most Popular',
                'badge_color': 'bg-blue-500 text-white font-medium',
                'rating': 4.7,
                'reviews_count': '8.1k',
                'price': 1099,
                'original_price': 1499,
                'is_featured': True,
                'description': 'Pure micronized creatine monohydrate to fuel strength, power, and cellular hydration.'
            },
            {
                'name': 'Cellucor C4 Pre-Workout',
                'slug': 'cellucor-c4-pre-workout',
                'category': cat_map.get('pre-workout'),
                'brand': 'Cellucor',
                'badge_text': 'Trending',
                'badge_color': 'bg-amber-500 text-black font-semibold',
                'rating': 4.6,
                'reviews_count': '6.2k',
                'price': 2299,
                'original_price': 2899,
                'is_featured': True,
                'description': 'Explosive energy and laser focus for high-intensity training sessions.'
            },
            {
                'name': 'MuscleBlaze MB-Vite Multivitamin',
                'slug': 'muscleblaze-mb-vite-multivitamin',
                'category': cat_map.get('vitamins'),
                'brand': 'MuscleBlaze',
                'badge_text': None,
                'rating': 4.6,
                'reviews_count': '4.1k',
                'price': 899,
                'original_price': 1199,
                'is_featured': True,
                'description': 'Comprehensive blend of 25 vitamins and minerals plus immunity boosters.'
            },
            {
                'name': 'MyProtein BCAA 8:1:1 Powder',
                'slug': 'myprotein-bcaa-8-1-1-powder',
                'category': cat_map.get('amino-acids'),
                'brand': 'MyProtein',
                'badge_text': None,
                'rating': 4.4,
                'reviews_count': '3.8k',
                'price': 1499,
                'original_price': 1999,
                'is_featured': True,
                'description': 'Essential branch chain amino acids in an optimal 8:1:1 ratio for enhanced recovery.'
            },
        ]

        created_products = {}
        for p in products:
            prod, _ = SupplementProduct.objects.update_or_create(
                slug=p['slug'],
                defaults=p
            )
            created_products[p['slug']] = prod

        # 4. Articles
        articles = [
            {
                'title': 'Do You Really Need Supplements?',
                'subtitle': 'A complete guide for beginners.',
                'content': 'Supplements are designed to complement a wholesome diet, not replace real whole foods.',
            },
            {
                'title': 'Creatine Benefits Explained',
                'subtitle': 'Boost strength and performance.',
                'content': 'Creatine increases phosphocreatine stores in muscles, enabling ATP replenishment during heavy lifts.',
            },
            {
                'title': 'Best Supplements for Muscle Gain',
                'subtitle': 'Top picks and how to use them.',
                'content': 'From Whey to Creatine and Omega 3, explore the tier-1 supplements backed by scientific literature.',
            },
        ]

        for a in articles:
            SupplementArticle.objects.get_or_create(title=a['title'], defaults=a)

        # 5. User Stack for demo_user
        stack_whey, _ = UserSupplementStack.objects.get_or_create(
            user=demo_user,
            name='Whey Protein Isolate',
            defaults={
                'product': created_products.get('optimum-nutrition-gold-standard-whey'),
                'category': 'Protein',
                'dosage': '1 Scoop (30g)',
                'timing': 'Post Workout',
                'status': 'Active',
            }
        )
        stack_creatine, _ = UserSupplementStack.objects.get_or_create(
            user=demo_user,
            name='Creatine Monohydrate',
            defaults={
                'product': created_products.get('muscleblaze-creatine-monohydrate'),
                'category': 'Creatine',
                'dosage': '5g',
                'timing': 'Post Workout',
                'status': 'Active',
            }
        )
        stack_vite, _ = UserSupplementStack.objects.get_or_create(
            user=demo_user,
            name='Daily Multivitamin',
            defaults={
                'product': created_products.get('muscleblaze-mb-vite-multivitamin'),
                'category': 'Vitamins',
                'dosage': '1 Tablet',
                'timing': 'After Breakfast',
                'status': 'Active',
            }
        )

        # 6. Reminders for demo_user
        SupplementReminder.objects.get_or_create(
            user=demo_user,
            name='Whey Protein Post-Workout',
            defaults={
                'stack_item': stack_whey,
                'dose': '1 Scoop',
                'time': '08:30 AM',
                'is_enabled': True,
            }
        )
        SupplementReminder.objects.get_or_create(
            user=demo_user,
            name='Creatine Monohydrate',
            defaults={
                'stack_item': stack_creatine,
                'dose': '5g',
                'time': '01:00 PM',
                'is_enabled': True,
            }
        )
        SupplementReminder.objects.get_or_create(
            user=demo_user,
            name='Multivitamin Tablet',
            defaults={
                'stack_item': stack_vite,
                'dose': '1 Tab',
                'time': '09:00 PM',
                'is_enabled': False,
            }
        )

        # 7. Goals for demo_user
        SupplementGoal.objects.get_or_create(
            user=demo_user,
            title='Daily Protein Goal',
            defaults={'percentage': 85, 'color': '#2BAF34'}
        )
        SupplementGoal.objects.get_or_create(
            user=demo_user,
            title='Hydration & Creatine',
            defaults={'percentage': 100, 'color': '#3B82F6'}
        )
        SupplementGoal.objects.get_or_create(
            user=demo_user,
            title='Vitamin Consistency',
            defaults={'percentage': 60, 'color': '#F59E0B'}
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all supplement data including stacks and reminders!'))
