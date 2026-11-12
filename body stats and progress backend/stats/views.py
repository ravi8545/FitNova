from datetime import date, timedelta

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Goal, Measurement, Milestone, ProgressPhoto, WorkoutLog
from .serializers import (
    GoalSerializer,
    MeasurementSerializer,
    MilestoneSerializer,
    ProgressPhotoSerializer,
    WorkoutLogSerializer,
)

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
GREEN, BLUE, PURPLE, AMBER = "#22c55e", "#2d7ff9", "#8b45e8", "#f5a524"
STAT_COLOR = {"weight": GREEN, "fat": BLUE, "muscle": PURPLE, "bmi": AMBER}
STAT_UNIT = {"weight": "kg", "fat": "%", "muscle": "kg", "bmi": ""}


def r1(n):
    return round(n * 10) / 10


def short_date(d):
    """2025-06-10 -> '10 Jun'."""
    return f"{d.day} {MONTHS[d.month - 1]}"


def _longest_streak(dates):
    """Longest run of consecutive calendar days in a list of dates."""
    if not dates:
        return 0
    unique = sorted(set(dates))
    best = run = 1
    for i in range(1, len(unique)):
        if (unique[i] - unique[i - 1]).days == 1:
            run += 1
            best = max(best, run)
        else:
            run = 1
    return best


def long_date(d):
    """2025-06-10 -> '10 Jun 2025'."""
    return f"{d.day:02d} {MONTHS[d.month - 1]} {d.year}"


# --------------------------------------------------------------------------
# CRUD ViewSets
# --------------------------------------------------------------------------
class MeasurementViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.all()
    serializer_class = MeasurementSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Create a measurement, or update the existing one for that date.

        The Body Stats page keeps one entry per day, so logging weight twice
        on the same day overwrites that day's row instead of adding a duplicate.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        date = serializer.validated_data.get("date")

        existing = Measurement.objects.filter(date=date).first()
        if existing:
            update = self.get_serializer(existing, data=request.data, partial=False)
            update.is_valid(raise_exception=True)
            update.save()
            return Response(update.data, status=status.HTTP_200_OK)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [permissions.AllowAny]


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.AllowAny]


class ProgressPhotoViewSet(viewsets.ModelViewSet):
    queryset = ProgressPhoto.objects.all()
    serializer_class = ProgressPhotoSerializer
    permission_classes = [permissions.AllowAny]


class WorkoutLogViewSet(viewsets.ModelViewSet):
    queryset = WorkoutLog.objects.all()
    serializer_class = WorkoutLogSerializer
    permission_classes = [permissions.AllowAny]


# --------------------------------------------------------------------------
# Aggregate read endpoints shaped for the frontend pages
# --------------------------------------------------------------------------
def _trend(measurements, count):
    """Return {labels, values} of the most recent `count` entries, oldest first."""
    rows = list(measurements[:count])[::-1]
    return {
        "labels": [short_date(m.date) for m in rows],
        "values": [m.weight for m in rows],
    }


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def body_stats(request):
    """Assemble the payload consumed by BodyStats.jsx."""
    measurements = Measurement.objects.all()  # ordered -date by Meta
    goals = {g.key: g for g in Goal.objects.all()}

    if not measurements:
        return Response({"detail": "No measurements yet."}, status=200)

    latest = measurements[0]
    prev = measurements[1] if len(measurements) > 1 else latest

    stat_defs = [
        ("weight", "Current Weight", latest.weight, prev.weight),
        ("fat", "Body Fat", latest.body_fat, prev.body_fat),
        ("muscle", "Muscle Mass", latest.muscle, prev.muscle),
        ("bmi", "BMI", latest.bmi, prev.bmi),
    ]
    stats = []
    for key, label, value, prev_value in stat_defs:
        g = goals.get(key)
        unit = STAT_UNIT[key]
        stats.append({
            "key": key,
            "goalId": g.id if g else None,  # lets the frontend PATCH this goal
            "label": label,
            "value": value,
            "unit": unit,
            "start": g.start if g else value,
            "startLabel": f"{g.start}{unit}" if g else f"{value}",
            "goal": g.goal if g else value,
            "goalLabel": f"{g.goal}{unit}" if g else f"{value}",
            "delta": r1(value - prev_value),
            "deltaUnit": unit,
            "color": STAT_COLOR[key],
        })

    recent = [
        {
            "date": long_date(m.date),
            "weight": m.weight,
            "fat": m.body_fat,
            "muscle": m.muscle,
            "bmi": m.bmi,
            "latest": i == 0,
        }
        for i, m in enumerate(measurements)
    ]

    measurements_card = [
        {"name": "Chest", "value": latest.chest or 0, "unit": "cm",
         "delta": r1((latest.chest or 0) - (prev.chest or 0)), "icon": "shirt"},
        {"name": "Waist", "value": latest.waist or 0, "unit": "cm",
         "delta": r1((latest.waist or 0) - (prev.waist or 0)), "icon": "ruler"},
        {"name": "Body Fat", "value": latest.body_fat, "unit": "%",
         "delta": r1(latest.body_fat - prev.body_fat), "icon": "activity"},
        {"name": "Arms", "value": latest.arms or 0, "unit": "cm",
         "delta": r1((latest.arms or 0) - (prev.arms or 0)), "icon": "dumbbell"},
        {"name": "Steps", "value": latest.steps or 0, "unit": "steps",
         "delta": (latest.steps or 0) - (prev.steps or 0), "icon": "footprints"},
    ]

    photos = ProgressPhotoSerializer(ProgressPhoto.objects.all(), many=True).data

    end = latest.date
    start = end - timedelta(days=6)
    range_label = (f"{MONTHS[start.month - 1]} {start.day:02d} – "
                   f"{MONTHS[end.month - 1]} {end.day:02d}, {end.year}")

    # Body composition breakdown
    fat_kg = r1(latest.weight * (latest.body_fat / 100.0))
    muscle_kg = latest.muscle
    other_kg = max(0.0, r1(latest.weight - fat_kg - muscle_kg))
    fat_pct = round(latest.body_fat)
    muscle_pct = round((muscle_kg / latest.weight) * 100) if latest.weight else 0
    other_pct = max(0, 100 - fat_pct - muscle_pct)

    composition = {
        "total": latest.weight,
        "parts": [
            {"name": "Muscle Mass", "kg": muscle_kg, "pct": muscle_pct, "color": "#22c55e"},
            {"name": "Fat Mass", "kg": fat_kg, "pct": fat_pct, "color": "#2d7ff9"},
            {"name": "Other", "kg": other_kg, "pct": other_pct, "color": "#8b45e8"},
        ],
    }

    # Summary goals calculation
    summary_goals = []
    goal_keys = [("weight", "Weight Goal", GREEN), ("fat", "Body Fat Goal", BLUE),
                 ("muscle", "Muscle Mass Goal", PURPLE), ("bmi", "BMI Goal", AMBER)]
    pct_list = []
    for k, name, col in goal_keys:
        g = goals.get(k)
        val = getattr(latest, "weight" if k == "weight" else "body_fat" if k == "fat" else k, 0)
        u = STAT_UNIT[k]
        if g:
            diff = abs(g.goal - g.start)
            achieved = abs(val - g.start)
            pct = min(100, max(0, round((achieved / diff) * 100))) if diff else 100
            pct_list.append(pct)
            summary_goals.append({
                "name": name,
                "icon": k,
                "color": col,
                "text": f"{val} {u} of {g.goal} {u} target".replace("  ", " "),
                "pct": pct,
            })
    overall_pct = round(sum(pct_list) / len(pct_list)) if pct_list else 68

    summary = {
        "pct": overall_pct,
        "goals": summary_goals,
    }

    insights = [
        {
            "tone": "green",
            "title": "Your weight is trending in the right direction.",
            "text": f"You have recorded {latest.weight} kg on your latest measurement. Keep following your routine consistently.",
        },
        {
            "tone": "purple",
            "title": "Your body fat percentage is on track.",
            "text": f"Your recorded body fat is at {latest.body_fat}%. Continue tracking measurements alongside weight.",
        },
        {
            "tone": "blue",
            "title": "Your muscle mass is improving.",
            "text": f"Your recorded muscle mass is currently {latest.muscle} kg. Maintain consistent strength training and recovery.",
        },
    ]

    user_name = "Anuj"
    if request.user and request.user.is_authenticated:
        user_name = request.user.first_name or request.user.email.split("@")[0]

    return Response({
        "user": user_name,
        "range": range_label,
        "latestId": latest.id,  # lets the frontend PATCH the latest measurement
        "stats": stats,
        "trend": {
            "7D": _trend(measurements, 7),
            "30D": _trend(measurements, 30),
            "90D": _trend(measurements, 90),
        },
        "measurements": measurements_card,
        "composition": composition,
        "photos": photos,
        "recent": recent,
        "insights": insights,
        "summary": summary,
        "quickActions": [
            {"key": "weight", "label": "Update Weight", "color": GREEN},
            {"key": "measure", "label": "Add Measurement", "color": BLUE},
            {"key": "goal", "label": "Set New Goals", "color": PURPLE},
            {"key": "report", "label": "View Progress Report", "color": AMBER},
        ],
    })


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def progress(request):
    """Assemble the payload consumed by Progress.jsx (milestones, photos, stats)."""
    milestones = MilestoneSerializer(Milestone.objects.all(), many=True).data
    photos = ProgressPhotoSerializer(ProgressPhoto.objects.all(), many=True).data

    measurements = list(Measurement.objects.all())  # ordered newest first
    weight_lost = 0.0
    muscle_gained = 0.0
    span_label = "Recent period"
    if measurements:
        latest = measurements[0]
        oldest = measurements[-1]
        weight_lost = r1(oldest.weight - latest.weight)
        muscle_gained = r1(latest.muscle - oldest.muscle)
        span_label = f"{short_date(oldest.date)} – {short_date(latest.date)}"

    pr_count = Milestone.objects.filter(pr=True).count()
    streak = _longest_streak([w.date for w in WorkoutLog.objects.all()])

    insights = [
        {
            "tone": "green",
            "title": f"You're making steady progress toward your goal.",
            "text": "Keep tracking your workouts and nutrition to maintain your streak.",
        },
        {
            "tone": "blue",
            "title": f"Muscle mass gained: {max(muscle_gained, 0)} kg",
            "text": "Your strength routines are yielding measurable growth!",
        },
    ]

    projected = {
        "pct": 72,
        "note": "Projected to hit body fat goal soon with consistent activity",
    }

    return Response({
        "range": span_label,
        "stats": [
            {"key": "weight", "label": "Total Weight Lost",
             "value": f"{max(weight_lost, 0)} kg", "sub": span_label,
             "done": weight_lost > 0},
            {"key": "muscle", "label": "Total Muscle Gained",
             "value": f"{max(muscle_gained, 0)} kg", "sub": span_label,
             "done": muscle_gained > 0},
            {"key": "pr", "label": "New Personal Records (PRs)",
             "value": f"{pr_count} New", "sub": span_label},
            {"key": "streak", "label": "Longest Workout Streak",
             "value": f"{streak} Days", "sub": span_label},
        ],
        "milestones": milestones,
        "photos": photos,
        "insights": insights,
        "projected": projected,
        "quickActions": [
            {"key": "share", "label": "Share Progress Summary", "color": GREEN},
            {"key": "compare", "label": "View Compare Tool", "color": BLUE},
            {"key": "milestones", "label": "Update Milestones", "color": PURPLE},
            {"key": "badges", "label": "View Achievement Badges", "color": AMBER},
        ],
    })


# --------------------------------------------------------------------------
# Performance-trends chart (Progress page)
# --------------------------------------------------------------------------
RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 90}  # "all" = everything
TARGET_POINTS = 7  # down-sample each window to roughly this many points


def _downsample(rows, n=TARGET_POINTS):
    """Pick up to `n` evenly-spaced rows from an oldest-first list."""
    if len(rows) <= n:
        return rows
    step = (len(rows) - 1) / (n - 1)
    picked = [rows[round(i * step)] for i in range(n)]
    # De-duplicate while preserving order (rounding can repeat an index).
    seen, out = set(), []
    for r in picked:
        key = id(r)
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out


def _window(rows, latest_date, range_key):
    """Filter oldest-first `rows` (each a dict with a 'date') to the range window."""
    if range_key == "all":
        selected = rows
    else:
        days = RANGE_DAYS.get(range_key, 30)
        cutoff = latest_date - timedelta(days=days)
        selected = [r for r in rows if r["date"] >= cutoff]
    # Guarantee at least two points so the chart renders a line.
    if len(selected) < 2:
        selected = rows[-2:] if len(rows) >= 2 else rows
    return _downsample(selected)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def progress_trends(request):
    """Build the `trends` object consumed by the Progress page chart.

    strength: a = weight (from Measurement), b = workout volume (from WorkoutLog)
    cardio:   a = pace, b = distance (both from WorkoutLog)
    Each mode exposes 7d / 30d / 90d / all windows.
    """
    measurements = list(Measurement.objects.all())        # newest first
    workouts = list(WorkoutLog.objects.all())             # newest first

    # Nothing to chart yet.
    if not measurements and not workouts:
        return Response({"detail": "No trend data yet."}, status=200)

    # "Today" is the most recent date across both datasets.
    candidate_dates = [m.date for m in measurements] + [w.date for w in workouts]
    latest_date = max(candidate_dates)

    # Oldest-first dicts keyed by date for merging.
    meas_rows = [{"date": m.date, "weight": m.weight} for m in reversed(measurements)]
    work_rows = [
        {"date": w.date, "volume": w.volume, "pace": w.pace, "distance": w.distance}
        for w in reversed(workouts)
    ]

    def strength_window(range_key):
        rows = _window(meas_rows, latest_date, range_key)
        vol_by_date = {w["date"]: w["volume"] for w in work_rows}
        # Nearest-known volume fallback so the blue line always has values.
        vols = [w["volume"] for w in work_rows]
        default_vol = round(sum(vols) / len(vols)) if vols else 0
        return {
            "labels": [short_date(r["date"]) for r in rows],
            "a": [r["weight"] for r in rows],
            "b": [vol_by_date.get(r["date"], default_vol) for r in rows],
        }

    def cardio_window(range_key):
        rows = _window(work_rows, latest_date, range_key)
        paces = [r["pace"] for r in rows if r["pace"] is not None]
        dists = [r["distance"] for r in rows if r["distance"] is not None]
        default_pace = round(sum(paces) / len(paces), 1) if paces else 6.0
        default_dist = round(sum(dists) / len(dists), 1) if dists else 0.0
        return {
            "labels": [short_date(r["date"]) for r in rows],
            "a": [r["pace"] if r["pace"] is not None else default_pace for r in rows],
            "b": [r["distance"] if r["distance"] is not None else default_dist for r in rows],
        }

    ranges = ["7d", "30d", "90d", "all"]
    trends = {
        "strength": {
            "meta": {
                "a": {"name": "Weight", "unit": "kg", "min": 80, "max": 88, "step": 2},
                "b": {"name": "Workout Volume", "unit": "sets", "min": 0, "max": 400, "step": 100},
            },
            **{rk: strength_window(rk) for rk in ranges},
        },
        "cardio": {
            "meta": {
                "a": {"name": "Pace", "unit": "min/km", "min": 5, "max": 7, "step": 0.5},
                "b": {"name": "Distance", "unit": "km", "min": 0, "max": 12, "step": 3},
            },
            **{rk: cardio_window(rk) for rk in ranges},
        },
    }
    return Response(trends)
