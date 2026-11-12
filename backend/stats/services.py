from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

from .models import BodyGoal, BodyMeasurement

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
GREEN = "#2BAF34"
BLUE = "#2D7FF9"
PURPLE = "#8B45E8"
AMBER = "#F5A524"

STAT_COLOR = {"weight": GREEN, "fat": BLUE, "muscle": PURPLE, "bmi": AMBER}
STAT_UNIT = {"weight": "kg", "fat": "%", "muscle": "kg", "bmi": ""}


def r1(n):
    """Round to 1 decimal place safely."""
    if n is None:
        return 0.0
    return round(float(n), 1)


def short_date(d):
    """2025-06-10 -> '10 Jun'."""
    if not d:
        return ""
    return f"{d.day} {MONTHS[d.month - 1]}"


def long_date(d):
    """2025-06-10 -> '10 Jun 2025'."""
    if not d:
        return ""
    return f"{d.day:02d} {MONTHS[d.month - 1]} {d.year}"


def calculate_bmi(user, weight):
    """Compute BMI using profile height in centimeters and weight in kg."""
    if not weight or weight <= 0:
        return None
    try:
        profile = getattr(user, "profile", None)
        if profile and profile.height and profile.height > 0:
            h_m = float(profile.height) / 100.0
            return r1(float(weight) / (h_m * h_m))
    except Exception:
        pass
    return None


def _build_trend(measurements, days_limit):
    """Filter measurements by date range and return {labels, values} in chronological order."""
    if not measurements:
        return {"labels": [], "values": []}

    latest_date = measurements[0].date
    cutoff = latest_date - timedelta(days=days_limit)
    in_range = [m for m in measurements if m.date >= cutoff]

    if not in_range:
        in_range = measurements[:min(len(measurements), 7)]

    # Oldest to newest
    ordered = sorted(in_range, key=lambda x: (x.date, x.created_at))

    # Downsample if more than 10 points
    if len(ordered) > 10:
        step = (len(ordered) - 1) / 9.0
        sampled = [ordered[round(i * step)] for i in range(10)]
        seen = set()
        deduped = []
        for row in sampled:
            if row.id not in seen:
                seen.add(row.id)
                deduped.append(row)
        ordered = deduped

    return {
        "labels": [short_date(m.date) for m in ordered],
        "values": [float(m.weight) for m in ordered],
    }


def get_body_stats_overview(user):
    """Assembles the full authenticated Body Stats response payload for the user."""
    measurements = list(BodyMeasurement.objects.filter(user=user).order_by("-date", "-created_at"))
    goals = {g.key: g for g in BodyGoal.objects.filter(user=user)}

    user_name = user.first_name or (user.email.split("@")[0] if user.email else "Athlete")

    if not measurements:
        return {
            "user": user_name,
            "range": "No measurements yet",
            "latestId": None,
            "stats": [],
            "trend": {
                "7D": {"labels": [], "values": []},
                "30D": {"labels": [], "values": []},
                "90D": {"labels": [], "values": []},
            },
            "measurements": [],
            "composition": {"total": 0, "parts": []},
            "recent": [],
            "insights": [
                {
                    "tone": "green",
                    "title": "Welcome to Body Stats!",
                    "text": "Log your first measurement using 'Update Weight' or 'Add Measurement' above to start tracking.",
                }
            ],
            "summary": {"pct": 0, "goals": []},
            "quickActions": [
                {"key": "weight", "label": "Update Weight", "color": GREEN},
                {"key": "measure", "label": "Add Measurement", "color": BLUE},
                {"key": "goal", "label": "Set New Goals", "color": PURPLE},
                {"key": "report", "label": "View Progress Report", "color": AMBER},
            ],
        }

    latest = measurements[0]
    prev = measurements[1] if len(measurements) > 1 else latest

    stat_defs = [
        ("weight", "Current Weight", latest.weight, prev.weight),
        ("fat", "Body Fat", latest.body_fat, prev.body_fat),
        ("muscle", "Muscle Mass", latest.muscle, prev.muscle),
        ("bmi", "BMI", latest.bmi, prev.bmi),
    ]

    stats = []
    for key, label, val, prev_val in stat_defs:
        g = goals.get(key)
        unit = STAT_UNIT[key]
        num_val = float(val) if val is not None else 0.0
        prev_num = float(prev_val) if prev_val is not None else num_val
        start_val = float(g.start) if g else num_val
        goal_val = float(g.goal) if g else num_val

        stats.append({
            "key": key,
            "goalId": g.id if g else None,
            "label": label,
            "value": num_val,
            "unit": unit,
            "start": start_val,
            "startLabel": f"{start_val} {unit}".strip(),
            "goal": goal_val,
            "goalLabel": f"{goal_val} {unit}".strip(),
            "delta": r1(num_val - prev_num),
            "deltaUnit": unit,
            "color": STAT_COLOR[key],
        })

    # Recent measurements list (limit 20)
    recent = [
        {
            "id": m.id,
            "date": long_date(m.date),
            "raw_date": m.date.isoformat(),
            "weight": float(m.weight),
            "fat": float(m.body_fat) if m.body_fat is not None else None,
            "muscle": float(m.muscle) if m.muscle is not None else None,
            "bmi": float(m.bmi) if m.bmi is not None else None,
            "chest": float(m.chest) if m.chest is not None else None,
            "waist": float(m.waist) if m.waist is not None else None,
            "arms": float(m.arms) if m.arms is not None else None,
            "steps": m.steps,
            "latest": i == 0,
        }
        for i, m in enumerate(measurements[:20])
    ]

    measurements_card = [
        {
            "name": "Chest",
            "value": float(latest.chest) if latest.chest else 0.0,
            "unit": "cm",
            "delta": r1((float(latest.chest) if latest.chest else 0) - (float(prev.chest) if prev.chest else 0)),
            "icon": "shirt",
        },
        {
            "name": "Waist",
            "value": float(latest.waist) if latest.waist else 0.0,
            "unit": "cm",
            "delta": r1((float(latest.waist) if latest.waist else 0) - (float(prev.waist) if prev.waist else 0)),
            "icon": "ruler",
        },
        {
            "name": "Body Fat",
            "value": float(latest.body_fat) if latest.body_fat else 0.0,
            "unit": "%",
            "delta": r1((float(latest.body_fat) if latest.body_fat else 0) - (float(prev.body_fat) if prev.body_fat else 0)),
            "icon": "activity",
        },
        {
            "name": "Arms",
            "value": float(latest.arms) if latest.arms else 0.0,
            "unit": "cm",
            "delta": r1((float(latest.arms) if latest.arms else 0) - (float(prev.arms) if prev.arms else 0)),
            "icon": "dumbbell",
        },
        {
            "name": "Steps",
            "value": latest.steps or 0,
            "unit": "steps",
            "delta": (latest.steps or 0) - (prev.steps or 0),
            "icon": "footprints",
        },
    ]

    # Date range label
    end_d = latest.date
    start_d = measurements[-1].date
    range_label = f"{MONTHS[start_d.month - 1]} {start_d.day:02d} – {MONTHS[end_d.month - 1]} {end_d.day:02d}, {end_d.year}"

    # Body composition breakdown
    total_wt = float(latest.weight)
    bf_pct = float(latest.body_fat) if latest.body_fat else 0.0
    fat_kg = r1(total_wt * (bf_pct / 100.0))
    muscle_kg = float(latest.muscle) if latest.muscle else 0.0
    other_kg = max(0.0, r1(total_wt - fat_kg - muscle_kg))

    fat_pct_round = round(bf_pct)
    muscle_pct_round = round((muscle_kg / total_wt) * 100) if total_wt > 0 else 0
    other_pct_round = max(0, 100 - fat_pct_round - muscle_pct_round)

    is_measured = bool(latest.body_fat is not None and latest.muscle is not None)
    composition = {
        "total": total_wt,
        "isMeasured": is_measured,
        "method": "Direct measured inputs" if is_measured else "Estimated breakdown based on recorded weight",
        "parts": [
            {"name": "Muscle Mass", "kg": muscle_kg, "pct": muscle_pct_round, "color": GREEN},
            {"name": "Fat Mass", "kg": fat_kg, "pct": fat_pct_round, "color": BLUE},
            {"name": "Other", "kg": other_kg, "pct": other_pct_round, "color": PURPLE},
        ],
    }

    # Summary goals calculation with goal-direction awareness
    summary_goals = []
    goal_keys = [
        ("weight", "Weight Goal", GREEN),
        ("fat", "Body Fat Goal", BLUE),
        ("muscle", "Muscle Mass Goal", PURPLE),
        ("bmi", "BMI Goal", AMBER),
    ]
    pct_list = []
    for k, name, col in goal_keys:
        g = goals.get(k)
        raw_val = getattr(latest, "weight" if k == "weight" else "body_fat" if k == "fat" else k, None)
        val = float(raw_val) if raw_val is not None else 0.0
        u = STAT_UNIT[k]
        if g:
            start_num = float(g.start)
            goal_num = float(g.goal)
            total_dist = abs(goal_num - start_num)
            if total_dist == 0:
                pct = 100
            else:
                if start_num > goal_num:
                    # Target is reduction (e.g. weight loss 85kg -> 75kg)
                    achieved = start_num - val
                else:
                    # Target is increase (e.g. muscle mass 58kg -> 65kg)
                    achieved = val - start_num
                pct = min(100, max(0, round((achieved / total_dist) * 100)))

            pct_list.append(pct)
            summary_goals.append({
                "name": name,
                "icon": k,
                "color": col,
                "text": f"{val} {u} of {goal_num} {u} target".replace("  ", " "),
                "pct": pct,
            })
    overall_pct = round(sum(pct_list) / len(pct_list)) if pct_list else 75

    summary = {
        "pct": overall_pct,
        "goals": summary_goals,
    }

    # Data-driven insights
    insights = []
    first_m = measurements[-1]
    net_wt_change = r1(float(latest.weight) - float(first_m.weight))
    if net_wt_change < 0:
        insights.append({
            "tone": "green",
            "title": f"You've lost {abs(net_wt_change)} kg since {short_date(first_m.date)}.",
            "text": f"Your current weight is {latest.weight} kg. Your downward trend is steady and sustainable.",
        })
    elif net_wt_change > 0:
        insights.append({
            "tone": "blue",
            "title": f"Weight change: +{net_wt_change} kg recorded.",
            "text": f"Current weight is {latest.weight} kg. Check muscle mass and nutrition to ensure lean mass growth.",
        })
    else:
        insights.append({
            "tone": "green",
            "title": "Weight is stable and maintained.",
            "text": f"Current weight is {latest.weight} kg. Your consistency is great for metabolic stability.",
        })

    if latest.body_fat:
        insights.append({
            "tone": "purple",
            "title": f"Recorded Body Fat: {latest.body_fat}%.",
            "text": "Continue maintaining high protein intake and progressive resistance training to optimize body composition.",
        })

    if latest.muscle:
        insights.append({
            "tone": "blue",
            "title": f"Current Muscle Mass: {latest.muscle} kg.",
            "text": "Keep tracking your strength sessions to monitor functional lean mass progression.",
        })

    return {
        "user": user_name,
        "range": range_label,
        "latestId": latest.id,
        "stats": stats,
        "trend": {
            "7D": _build_trend(measurements, 7),
            "30D": _build_trend(measurements, 30),
            "90D": _build_trend(measurements, 90),
        },
        "measurements": measurements_card,
        "composition": composition,
        "recent": recent,
        "insights": insights,
        "summary": summary,
        "quickActions": [
            {"key": "weight", "label": "Update Weight", "color": GREEN},
            {"key": "measure", "label": "Add Measurement", "color": BLUE},
            {"key": "goal", "label": "Set New Goals", "color": PURPLE},
            {"key": "report", "label": "View Progress Report", "color": AMBER},
        ],
    }

