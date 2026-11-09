import HomePageLink from "./HomePageLink";
import {
  Apple,
  BarChart3,
  Droplets,
  Dumbbell,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    title: "Workout",
    description:
      "Create a workout routine that fits your fitness goals and daily schedule.",
    path: "/workout",
    icon: Dumbbell,
    color: "green",
  },
  {
    title: "Nutrition",
    description:
      "Keep track of meals, calories and nutrition to support your fitness journey.",
    path: "/nutrition",
    icon: Apple,
    color: "yellow",
  },
  {
    title: "Water Intake",
    description:
      "Monitor your daily hydration and develop healthier drinking habits.",
    path: "/water-intake",
    icon: Droplets,
    color: "blue",
  },
  {
    title: "Progress",
    description:
      "Review your fitness milestones and stay motivated by your progress.",
    path: "/progress",
    icon: BarChart3,
    color: "purple",
  },
];

export default function FeatureCards({ onNavigate }) {
  return (
    <section className="home-feature-section" id="features">
      <div className="home-section-heading">
        <span className="home-eyebrow">YOUR FITNESS TOOLKIT</span>
        <h2>
          Everything You Need
          <br />
          <span>In One Place.</span>
        </h2>
        <p>
          Stay organized, build healthy routines and make every step
          toward your fitness goals count.
        </p>
      </div>

      <div className="feature-cards">
        {features.map(({ title, description, path, icon: Icon, color }) => (
          <article className={`feature-card feature-${color}`} key={title}>
            <span className="feature-card-icon">
              <Icon size={23} />
            </span>

            <h3>{title}</h3>
            <p>{description}</p>

            <HomePageLink onNavigate={onNavigate} to={path} aria-label={`Explore ${title}`}>
              Explore <ArrowUpRight size={16} />
            </HomePageLink>
          </article>
        ))}
      </div>
    </section>
  );
}