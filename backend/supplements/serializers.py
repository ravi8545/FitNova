from rest_framework import serializers
from django.utils import timezone
from .models import (
    SupplementCategory,
    SupplementProduct,
    UserSupplementStack,
    SupplementReminder,
    SupplementDailyLog,
    SupplementGoal,
    SupplementWishlist,
    SupplementCartItem,
    SupplementArticle,
)

class SupplementCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplementCategory
        fields = ('id', 'slug', 'name', 'description', 'icon', 'icon_url', 'display_order')


class SupplementProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    badge = serializers.SerializerMethodField()
    reviewsCount = serializers.CharField(source='reviews_count', read_only=True)
    originalPrice = serializers.DecimalField(source='original_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SupplementProduct
        fields = (
            'id', 'name', 'slug', 'category', 'category_slug', 'brand',
            'image', 'image_url', 'badge', 'badge_text', 'badge_color',
            'rating', 'reviews_count', 'reviewsCount', 'price',
            'original_price', 'originalPrice', 'discount_percent',
            'description', 'benefits', 'in_stock', 'is_featured'
        )

    def get_badge(self, obj):
        if obj.badge_text:
            return {
                'text': obj.badge_text,
                'color': obj.badge_color or 'bg-[#2BAF34] text-black font-semibold'
            }
        return None


class UserSupplementStackSerializer(serializers.ModelSerializer):
    product_details = SupplementProductSerializer(source='product', read_only=True)
    startDate = serializers.DateField(source='start_date', read_only=True)
    image = serializers.CharField(source='image_url', read_only=True)

    class Meta:
        model = UserSupplementStack
        fields = (
            'id', 'name', 'category', 'product', 'product_details', 'dosage', 'timing',
            'start_date', 'startDate', 'end_date', 'status',
            'image', 'image_url', 'notes', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        # Normalize camelCase to snake_case for writable fields
        if 'startDate' in data and 'start_date' not in data:
            data['start_date'] = data['startDate']
        if 'image' in data and 'image_url' not in data:
            data['image_url'] = data['image']
        return super().to_internal_value(data)

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Supplement name is required.")
        return value.strip()

    def validate_dosage(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Dosage is required.")
        return value.strip()

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class SupplementReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplementReminder
        fields = ('id', 'name', 'dose', 'time', 'is_enabled', 'icon_url', 'stack_item', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Reminder name is required.")
        return value.strip()

    def validate_dose(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Dose is required.")
        return value.strip()

    def validate_time(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Reminder time is required.")
        return value.strip()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SupplementDailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplementDailyLog
        fields = ('id', 'stack_item', 'date', 'is_taken', 'taken_at')
        read_only_fields = ('id', 'taken_at')

    def create(self, validated_data):
        user = self.context['request'].user
        stack_item = validated_data['stack_item']
        log_date = validated_data.get('date') or timezone.localdate()
        is_taken = validated_data.get('is_taken', True)

        log, _ = SupplementDailyLog.objects.update_or_create(
            user=user,
            stack_item=stack_item,
            date=log_date,
            defaults={'is_taken': is_taken}
        )
        return log


class SupplementGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplementGoal
        fields = ('id', 'title', 'percentage', 'color')

    def validate_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Percentage must be between 0 and 100.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SupplementArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplementArticle
        fields = ('id', 'title', 'subtitle', 'content', 'image_url', 'published_date')


class SupplementWishlistSerializer(serializers.ModelSerializer):
    product_details = SupplementProductSerializer(source='product', read_only=True)

    class Meta:
        model = SupplementWishlist
        fields = ('id', 'product', 'product_details', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        user = self.context['request'].user
        product = attrs.get('product')
        # Check duplicate on creation
        if not self.instance and SupplementWishlist.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError({"detail": "This product is already in your wishlist."})
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SupplementCartItemSerializer(serializers.ModelSerializer):
    product_details = SupplementProductSerializer(source='product', read_only=True)

    class Meta:
        model = SupplementCartItem
        fields = ('id', 'product', 'product_details', 'quantity', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        if value > 100:
            raise serializers.ValidationError("Quantity cannot exceed 100.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)

        # Increment quantity if item already in cart
        cart_item, created = SupplementCartItem.objects.get_or_create(
            user=user,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save(update_fields=['quantity'])
        return cart_item
