from django.contrib import admin
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

@admin.register(SupplementCategory)
class SupplementCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order')

@admin.register(SupplementProduct)
class SupplementProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'original_price', 'rating', 'in_stock', 'is_featured')
    list_filter = ('category', 'in_stock', 'is_featured')
    search_fields = ('name', 'brand')

@admin.register(UserSupplementStack)
class UserSupplementStackAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'dosage', 'timing', 'status', 'start_date')

@admin.register(SupplementReminder)
class SupplementReminderAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'dose', 'time', 'is_enabled')

admin.site.register(SupplementDailyLog)
admin.site.register(SupplementGoal)
admin.site.register(SupplementArticle)
admin.site.register(SupplementWishlist)
admin.site.register(SupplementCartItem)
