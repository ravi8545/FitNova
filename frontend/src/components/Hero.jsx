import { ArrowRight, Activity, CheckCircle2 } from "lucide-react";
import HomePageLink from "./HomePageLink";

export default function Hero({ onNavigate }) {
  return (
    <section className="fitnova-hero">
      <div className="fitnova-hero-content">
        <span className="hero-eyebrow">
          <Activity size={15} />
          YOUR FITNESS, YOUR WAY
        </span>

        <h1>
          Build a stronger,
          <br />
          <span>healthier you.</span>
        </h1>

        <p>
          Bring your workouts, nutrition, water intake and daily habits
          together in one place. Track your progress, build consistency
          and keep moving toward your fitness goals.
        </p>

        <div className="hero-benefits">
          <span>
            <CheckCircle2 size={16} />
            Personalized fitness goals
          </span>
          <span>
            <CheckCircle2 size={16} />
            Track your daily progress
          </span>
        </div>

        <div className="hero-actions">
          <HomePageLink onNavigate={onNavigate} to="/workout" className="hero-primary-button">
            Explore Workouts <ArrowRight size={17} />
          </HomePageLink>

          <HomePageLink onNavigate={onNavigate} to="/nutrition" className="hero-secondary-button">
            Explore Nutrition
          </HomePageLink>
        </div>
      </div>

      <div className="fitnova-hero-visual">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85"
          alt="Fitness gym equipped for strength and cardio training"
          fetchPriority="high"
        />
        <div className="hero-image-overlay" />

        <div className="hero-image-caption">
          <span className="hero-status-dot" />
          YOUR JOURNEY STARTS TODAY
        </div>
      </div>
    </section>
  );
}