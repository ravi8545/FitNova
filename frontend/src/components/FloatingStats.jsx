import { Activity, Droplets, Flame, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Daily Calories",
    value: "1,980 kcal",
    icon: Flame,
    color: "green",
  },
  {
    label: "Water Intake",
    value: "2.6 litres",
    icon: Droplets,
    color: "blue",
  },
  {
    label: "Workouts",
    value: "Stay Consistent",
    icon: Activity,
    color: "purple",
  },
  {
    label: "Weekly Progress",
    value: "Keep Improving",
    icon: TrendingUp,
    color: "yellow",
  },
];

export default function FloatingStats() {
  return (
    <section className="floating-stats" aria-label="Fitness highlights">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <article className={`floating-stat floating-${color}`} key={label}>
          <span className="floating-stat-icon">
            <Icon size={21} />
          </span>

          <div className="floating-stat-content">
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}