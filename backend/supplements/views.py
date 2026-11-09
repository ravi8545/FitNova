from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta

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
from .serializers import (
    SupplementCategorySerializer,
    SupplementProductSerializer,
    UserSupplementStackSerializer,
    SupplementReminderSerializer,
    SupplementDailyLogSerializer,
    SupplementGoalSerializer,
    SupplementWishlistSerializer,
    SupplementCartItemSerializer,
    SupplementArticleSerializer,
)


class SupplementCategoryViewSet(viewsets.ModelViewSet):
    queryset = SupplementCategory.objects.all()
    serializer_class = SupplementCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class SupplementProductViewSet(viewsets.ModelViewSet):
    queryset = SupplementProduct.objects.select_related('category').all()
    serializer_class = SupplementProductSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ('name', 'brand', 'description', 'category__name', 'category__slug')
    ordering_fields = ('price', 'rating', 'created_at')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Hide out-of-stock items for non-staff
        if not (user and user.is_authenticated and user.is_staff):
            qs = qs.filter(in_stock=True)

        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(category__slug__iexact=category)
        return qs


class UserSupplementStackViewSet(viewsets.ModelViewSet):
    serializer_class = UserSupplementStackSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = UserSupplementStack.objects.filter(user=self.request.user).select_related('product')
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter.lower() != 'all':
            qs = qs.filter(status__iexact=status_filter)
        return qs


class SupplementReminderViewSet(viewsets.ModelViewSet):
    serializer_class = SupplementReminderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return SupplementReminder.objects.filter(user=self.request.user).select_related('stack_item')

    @action(detail=True, methods=['post', 'patch'])
    def toggle(self, request, pk=None):
        reminder = self.get_object()
        reminder.is_enabled = not reminder.is_enabled
        reminder.save(update_fields=['is_enabled'])
        return Response({
            'id': reminder.id,
            'is_enabled': reminder.is_enabled,
            'status': 'updated'
        }, status=status.HTTP_200_OK)


class SupplementDailyLogViewSet(viewsets.ModelViewSet):
    serializer_class = SupplementDailyLogSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return SupplementDailyLog.objects.filter(user=self.request.user).select_related('stack_item')


class SupplementGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SupplementGoalSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return SupplementGoal.objects.filter(user=self.request.user)


class SupplementArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SupplementArticle.objects.filter(is_published=True)
    serializer_class = SupplementArticleSerializer
    permission_classes = (permissions.AllowAny,)


class SupplementWishlistViewSet(viewsets.ModelViewSet):
    serializer_class = SupplementWishlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return SupplementWishlist.objects.filter(user=self.request.user).select_related('product')

    @action(detail=False, methods=['delete'])
    def remove_by_product(self, request):
        product_id = request.query_params.get('product') or request.data.get('product')
        if not product_id:
            return Response({'detail': 'Product ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        deleted_count, _ = SupplementWishlist.objects.filter(user=request.user, product_id=product_id).delete()
        return Response({'deleted': deleted_count}, status=status.HTTP_200_OK)


class SupplementCartViewSet(viewsets.ModelViewSet):
    serializer_class = SupplementCartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return SupplementCartItem.objects.filter(user=self.request.user).select_related('product')

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        count, _ = SupplementCartItem.objects.filter(user=request.user).delete()
        return Response({'detail': 'Cart cleared successfully.', 'count': count}, status=status.HTTP_200_OK)


class SupplementOverviewView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        stacks = UserSupplementStack.objects.filter(user=user)
        active_count = stacks.filter(status='Active').count()
        completed_count = stacks.filter(status='Completed').count()
        reminders_count = SupplementReminder.objects.filter(user=user, is_enabled=True).count()

        # Calculate actual consecutive adherence streak
        today = timezone.localdate()
        streak_days = 0
        current_date = today

        while True:
            has_log = SupplementDailyLog.objects.filter(
                user=user,
                date=current_date,
                is_taken=True
            ).exists()
            if has_log:
                streak_days += 1
                current_date -= timedelta(days=1)
            else:
                # If today hasn't been logged yet, allow streak to continue from yesterday
                if current_date == today:
                    current_date -= timedelta(days=1)
                    continue
                break

        goals = SupplementGoal.objects.filter(user=user)
        goal_data = SupplementGoalSerializer(goals, many=True).data

        return Response({
            'overview': {
                'activeCount': active_count,
                'completedCount': completed_count,
                'streakDays': streak_days,
                'remindersCount': reminders_count,
            },
            'goals': goal_data,
        })
