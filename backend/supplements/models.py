from django.db import models
from django.conf import settings
from django.utils import timezone

class SupplementCategory(models.Model):
    slug = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    icon = models.ImageField(upload_to='supplement_categories/', blank=True, null=True)
    icon_url = models.CharField(max_length=500, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Supplement Categories'

    def __str__(self):
        return self.name


class SupplementProduct(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.ForeignKey(
        SupplementCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='products'
    )
    category_fallback = models.CharField(max_length=50, blank=True)
    brand = models.CharField(max_length=150)
    image = models.ImageField(upload_to='supplements/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True)
    
    badge_text = models.CharField(max_length=50, blank=True, null=True)
    badge_color = models.CharField(max_length=100, blank=True, null=True)
    
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    reviews_count = models.CharField(max_length=20, default='0')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    description = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    in_stock = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_featured', '-rating', 'name']

    def __str__(self):
        return f"{self.brand} - {self.name}"

    @property
    def discount_percent(self):
        if self.original_price and self.original_price > self.price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(f"{self.brand}-{self.name}") or slugify(self.name) or "product"
            slug = base_slug
            idx = 1
            while SupplementProduct.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{idx}"
                idx += 1
            self.slug = slug
        super().save(*args, **kwargs)


class UserSupplementStack(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Paused', 'Paused'),
        ('Completed', 'Completed'),
    )

    TIMING_CHOICES = (
        ('Pre Workout', 'Pre Workout'),
        ('Post Workout', 'Post Workout'),
        ('After Breakfast', 'After Breakfast'),
        ('After Dinner', 'After Dinner'),
        ('Before Bed', 'Before Bed'),
        ('With Water Daily', 'With Water Daily'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplement_stack'
    )
    product = models.ForeignKey(
        SupplementProduct,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stack_items'
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='Protein')
    image_url = models.CharField(max_length=500, blank=True)
    dosage = models.CharField(max_length=100)
    timing = models.CharField(max_length=50, choices=TIMING_CHOICES, default='Post Workout')
    start_date = models.DateField(default=timezone.localdate)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.user})"


class SupplementReminder(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplement_reminders'
    )
    stack_item = models.ForeignKey(
        UserSupplementStack,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reminders'
    )
    name = models.CharField(max_length=150)
    dose = models.CharField(max_length=100)
    time = models.CharField(max_length=50)
    is_enabled = models.BooleanField(default=True)
    icon_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reminder: {self.name} at {self.time}"


class SupplementDailyLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplement_logs'
    )
    stack_item = models.ForeignKey(
        UserSupplementStack,
        on_delete=models.CASCADE,
        related_name='daily_logs'
    )
    date = models.DateField(default=timezone.localdate)
    is_taken = models.BooleanField(default=True)
    taken_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'stack_item', 'date')
        ordering = ['-date']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]


class SupplementGoal(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplement_goals'
    )
    title = models.CharField(max_length=150)
    percentage = models.PositiveIntegerField(default=50)
    color = models.CharField(max_length=30, default='#2BAF34')
    created_at = models.DateTimeField(auto_now_add=True)


class SupplementWishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplement_wishlist'
    )
    product = models.ForeignKey(
        SupplementProduct,
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')


class SupplementCartItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='supplement_cart'
    )
    product = models.ForeignKey(
        SupplementProduct,
        on_delete=models.CASCADE,
        related_name='in_carts'
    )
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')


class SupplementArticle(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    published_date = models.DateField(default=timezone.localdate)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-published_date']
