from django.contrib import admin
from .models import (
    DailyHealthLog,
    ReportGoal,
    ReportAreaOfImprovement,
    ReportAIInsight,
    RecentActivity,
)

@admin.register(DailyHealthLog)
class DailyHealthLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'calories_consumed', 'calories_burned', 'protein_g', 'water_liters', 'weight_kg')

admin.site.register(ReportGoal)
admin.site.register(ReportAreaOfImprovement)
admin.site.register(ReportAIInsight)
admin.site.register(RecentActivity)
