from datetime import timedelta
from django.utils import timezone

from .models import ProgressMilestone, ProgressPhoto, WorkoutLog

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
GREEN = "#2BAF34"
BLUE = "#3B82F6"
PURPLE = "#8B45E8"
AMBER = "#F5A524"


def r1(n):
    if n is None:
        return 0.0
    return round(float(n), 1)


def short_date(d):
    if not d:
        return ""
    return f"{d.day} {MONTHS[d.month - 1]}"


def long_date(d):
    if not d:
        return ""
    return f"{d.day:02d} {MONTHS[d.month - 1]} {d.year}"


def _longest_streak(dates):
    """Calculates the longest consecutive calendar day run in a list of dates."""
    if not dates:
        return 0
    unique = sorted(set(dates))
    best = run = 1
    for i in range(1, len(unique)):
        diff = (unique[i] - unique[i - 1]).days
        if diff == 1:
            run += 1
            best = max(best, run)
        elif diff > 1:
            run = 1
    return best


def _current_streak(dates):
    """Calculates active workout streak ending today or yesterday."""
    if not dates:
        return 0
    today = timezone.localdate()
    unique = sorted(set(dates), reverse=True)
    if not unique:
        return 0
    latest = unique[0]
    if (today - latest).days > 1:
        return 0

    streak = 1
    curr = latest
    for d in unique[1:]:
        if (curr - d).days == 1:
            streak += 1
            curr = d
        else:
            break
    return streak


def _downsample(rows, n=7):
    """Evenly samples up to `n` items from a chronological list."""
    if len(rows) <= n:
        return rows
    step = (len(rows) - 1) / (n - 1)
    picked = [rows[round(i * step)] for i in range(n)]
    seen, out = set(), []
    for r in picked:
        key = id(r)
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out


def _window(rows, latest_date, range_key):
    """Filters oldest-first rows by range window."""
    range_map = {"7d": 7, "30d": 30, "90d": 90}
    if range_key == "all" or range_key not in range_map:
        selected = rows
    else:
        cutoff = latest_date - timedelta(days=range_map[range_key])
        selected = [r for r in rows if r["date"] >= cutoff]
    if len(selected) < 2 and len(rows) >= 2:
        selected = rows[-2:]
    return _downsample(selected)


def get_progress_trends(user):
    """Builds performance trends for strength (weight + volume) and cardio (pace + distance)."""
    # Lazy import to prevent circular dependency
    from stats.models import BodyMeasurement

    measurements = list(BodyMeasurement.objects.filter(user=user).order_by("-date", "-created_at"))
    workouts = list(WorkoutLog.objects.filter(user=user).order_by("-date", "-created_at"))

    if not measurements and not workouts:
        empty_chart = {"labels": [], "a": [], "b": []}
        return {
            "strength": {
                "meta": {
                    "a": {"name": "Weight", "unit": "kg", "min": 50, "max": 100, "step": 10},
                    "b": {"name": "Workout Volume", "unit": "sets", "min": 0, "max": 300, "step": 50},
                },
                "7d": empty_chart,
                "30d": empty_chart,
                "90d": empty_chart,
                "all": empty_chart,
            },
            "cardio": {
                "meta": {
                    "a": {"name": "Pace", "unit": "min/km", "min": 4, "max": 8, "step": 1},
                    "b": {"name": "Distance", "unit": "km", "min": 0, "max": 15, "step": 3},
                },
                "7d": empty_chart,
                "30d": empty_chart,
                "90d": empty_chart,
                "all": empty_chart,
            },
        }

    candidate_dates = [m.date for m in measurements] + [w.date for w in workouts]
    latest_date = max(candidate_dates) if candidate_dates else timezone.localdate()

    meas_rows = [{"date": m.date, "weight": float(m.weight)} for m in reversed(measurements)]
    work_rows = [
        {
            "date": w.date,
            "volume": w.volume,
            "pace": float(w.pace) if w.pace is not None else None,
            "distance": float(w.distance) if w.distance is not None else None,
        }
        for w in reversed(workouts)
    ]

    all_weights = [r["weight"] for r in meas_rows]
    min_wt = min(all_weights) if all_weights else 70.0
    max_wt = max(all_weights) if all_weights else 90.0
    wt_axis_min = max(0, round(min_wt - 3))
    wt_axis_max = round(max_wt + 3)

    all_vols = [w["volume"] for w in work_rows]
    max_vol = max(all_vols) if all_vols else 250
    vol_axis_max = max(100, round((max_vol + 50) / 50) * 50)

    def strength_window(range_key):
        rows = _window(meas_rows, latest_date, range_key) if meas_rows else _window(work_rows, latest_date, range_key)
        vol_by_date = {w["date"]: w["volume"] for w in work_rows}
        default_vol = round(sum(all_vols) / len(all_vols)) if all_vols else 0
        default_wt = round(sum(all_weights) / len(all_weights), 1) if all_weights else 75.0
        wt_by_date = {m["date"]: m["weight"] for m in meas_rows}

        labels = [short_date(r["date"]) for r in rows]
        series_a = [wt_by_date.get(r["date"], default_wt) for r in rows]
        series_b = [vol_by_date.get(r["date"], default_vol) for r in rows]
        return {"labels": labels, "a": series_a, "b": series_b}

    def cardio_window(range_key):
        rows = _window(work_rows, latest_date, range_key)
        paces = [r["pace"] for r in rows if r["pace"] is not None]
        dists = [r["distance"] for r in rows if r["distance"] is not None]
        default_pace = round(sum(paces) / len(paces), 1) if paces else 6.0
        default_dist = round(sum(dists) / len(dists), 1) if dists else 3.0

        labels = [short_date(r["date"]) for r in rows]
        series_a = [r["pace"] if r["pace"] is not None else default_pace for r in rows]
        series_b = [r["distance"] if r["distance"] is not None else default_dist for r in rows]
        return {"labels": labels, "a": series_a, "b": series_b}

    ranges = ["7d", "30d", "90d", "all"]
    return {
        "strength": {
            "meta": {
                "a": {"name": "Weight", "unit": "kg", "min": wt_axis_min, "max": wt_axis_max, "step": max(1, round((wt_axis_max - wt_axis_min) / 4))},
                "b": {"name": "Workout Volume", "unit": "sets", "min": 0, "max": vol_axis_max, "step": max(20, round(vol_axis_max / 4))},
            },
            **{rk: strength_window(rk) for rk in ranges},
        },
        "cardio": {
            "meta": {
                "a": {"name": "Pace", "unit": "min/km", "min": 4.0, "max": 8.0, "step": 1.0},
                "b": {"name": "Distance", "unit": "km", "min": 0.0, "max": 12.0, "step": 3.0},
            },
            **{rk: cardio_window(rk) for rk in ranges},
        },
    }


def get_progress_overview(user, request=None):
    """Builds the comprehensive Progress overview payload."""
    from stats.models import BodyMeasurement
    from .serializers import ProgressMilestoneSerializer, ProgressPhotoSerializer

    milestones_qs = ProgressMilestone.objects.filter(user=user)
    photos_qs = ProgressPhoto.objects.filter(user=user)
    workouts_qs = WorkoutLog.objects.filter(user=user)
    measurements = list(BodyMeasurement.objects.filter(user=user).order_by("-date", "-created_at"))

    milestones_data = ProgressMilestoneSerializer(milestones_qs, many=True).data
    photos_data = ProgressPhotoSerializer(photos_qs, many=True, context={"request": request}).data

    weight_lost = 0.0
    muscle_gained = 0.0
    span_label = "Past 30 Days"
    if measurements:
        latest = measurements[0]
        oldest = measurements[-1]
        weight_lost = r1(float(oldest.weight) - float(latest.weight))
        if latest.muscle and oldest.muscle:
            muscle_gained = r1(float(latest.muscle) - float(oldest.muscle))
        span_label = f"{short_date(oldest.date)} – {short_date(latest.date)}"

    pr_count = milestones_qs.filter(pr=True).count()
    workout_dates = [w.date for w in workouts_qs]
    longest_streak = _longest_streak(workout_dates)
    active_streak = _current_streak(workout_dates)

    # Dynamic Insights
    insights = []
    if weight_lost > 0:
        insights.append({
            "tone": "green",
            "title": f"Steady progression: {weight_lost} kg lost so far.",
            "text": "Your caloric deficit and activity tracking are proving effective across the recorded period.",
        })
    elif weight_lost < 0:
        insights.append({
            "tone": "blue",
            "title": f"Weight surplus of +{abs(weight_lost)} kg tracked.",
            "text": "Great if you are in a bulking phase! Ensure sufficient protein to prioritize lean mass over fat.",
        })
    else:
        insights.append({
            "tone": "green",
            "title": "Maintaining weight balance consistently.",
            "text": "Your recorded metrics show stable body mass maintenance across your recent sessions.",
        })

    if muscle_gained > 0:
        insights.append({
            "tone": "purple",
            "title": f"Muscle mass gained: +{muscle_gained} kg.",
            "text": "Your resistance training programming is yielding measurable hypertrophy results.",
        })

    if longest_streak > 0:
        insights.append({
            "tone": "blue",
            "title": f"Longest workout streak: {longest_streak} days.",
            "text": f"Active workout streak is currently {active_streak} days. Keep moving every day!",
        })

    # Realistic projection calculation based on actual progress
    projected_pct = 75
    if weight_lost > 0:
        projected_pct = min(95, 60 + int(weight_lost * 4))
    projected = {
        "pct": projected_pct,
        "note": "Estimated trajectory toward target goal based on current 30-day activity",
    }

    return {
        "range": span_label,
        "stats": [
            {
                "key": "weight",
                "label": "Total Weight Lost",
                "value": f"{max(weight_lost, 0.0)} kg",
                "sub": span_label,
                "done": weight_lost > 0,
            },
            {
                "key": "muscle",
                "label": "Total Muscle Gained",
                "value": f"{max(muscle_gained, 0.0)} kg",
                "sub": span_label,
                "done": muscle_gained > 0,
            },
            {
                "key": "pr",
                "label": "New Personal Records (PRs)",
                "value": f"{pr_count} New",
                "sub": span_label,
            },
            {
                "key": "streak",
                "label": "Longest Workout Streak",
                "value": f"{longest_streak} Days",
                "sub": span_label,
            },
        ],
        "milestones": milestones_data,
        "photos": photos_data,
        "insights": insights,
        "projected": projected,
        "quickActions": [
            {"key": "share", "label": "Share Progress Summary", "color": GREEN},
            {"key": "compare", "label": "View Compare Tool", "color": BLUE},
            {"key": "milestones", "label": "Update Milestones", "color": PURPLE},
            {"key": "badges", "label": "View Achievement Badges", "color": AMBER},
        ],
    }


def get_user_achievements(user):
    """Calculates achievement badges based on user's actual database records."""
    from stats.models import BodyMeasurement

    meas_count = BodyMeasurement.objects.filter(user=user).count()
    workouts_count = WorkoutLog.objects.filter(user=user).count()
    milestones_qs = ProgressMilestone.objects.filter(user=user)
    pr_count = milestones_qs.filter(pr=True).count()
    streak = _longest_streak([w.date for w in WorkoutLog.objects.filter(user=user)])

    achievements = [
        {
            "id": "first_step",
            "title": "First Step",
            "desc": "Logged your first body measurement",
            "icon": "Footprints",
            "unlocked": meas_count >= 1,
            "progress": f"{min(meas_count, 1)}/1",
        },
        {
            "id": "streak_7",
            "title": "7-Day Warrior",
            "desc": "Maintained a 7-day workout streak",
            "icon": "Flame",
            "unlocked": streak >= 7,
            "progress": f"{min(streak, 7)}/7 Days",
        },
        {
            "id": "pr_breaker",
            "title": "Record Breaker",
            "desc": "Set at least 3 personal records",
            "icon": "Trophy",
            "unlocked": pr_count >= 3,
            "progress": f"{min(pr_count, 3)}/3 PRs",
        },
        {
            "id": "workout_20",
            "title": "Club 20",
            "desc": "Completed 20 logged workout sessions",
            "icon": "Dumbbell",
            "unlocked": workouts_count >= 20,
            "progress": f"{min(workouts_count, 20)}/20 Sessions",
        },
    ]
    return achievements

