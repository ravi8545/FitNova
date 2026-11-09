from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplementCategoryViewSet,
    SupplementProductViewSet,
    UserSupplementStackViewSet,
    SupplementReminderViewSet,
    SupplementDailyLogViewSet,
    SupplementGoalViewSet,
    SupplementWishlistViewSet,
    SupplementCartViewSet,
    SupplementArticleViewSet,
    SupplementOverviewView,
)

router = DefaultRouter()
router.register(r'categories', SupplementCategoryViewSet, basename='supplement-category')
router.register(r'products', SupplementProductViewSet, basename='supplement-product')
router.register(r'stack', UserSupplementStackViewSet, basename='user-stack')
router.register(r'reminders', SupplementReminderViewSet, basename='supplement-reminder')
router.register(r'logs', SupplementDailyLogViewSet, basename='supplement-log')
router.register(r'goals', SupplementGoalViewSet, basename='supplement-goal')
router.register(r'articles', SupplementArticleViewSet, basename='supplement-article')
router.register(r'wishlist', SupplementWishlistViewSet, basename='supplement-wishlist')
router.register(r'cart', SupplementCartViewSet, basename='supplement-cart')

urlpatterns = [
    path('overview/', SupplementOverviewView.as_view(), name='supplement-overview'),
    path('', include(router.urls)),
]
