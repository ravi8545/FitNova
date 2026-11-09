import HomePageLink from "../components/HomePageLink";
import Hero from "../components/Hero";
import FeatureCards from "../components/FeatureCards";
import FloatingStats from "../components/FloatingStats";
import Footer from "../components/Footer";

import "../styles/Home.css";

const workoutPrograms = [
  {
    number: "01",
    category: "STRENGTH",
    title: "Build Your Strength",
    description:
      "Develop strength and improve endurance with a balanced resistance-training routine.",
    duration: "30–45 min",
    level: "Beginner friendly",
    icon: "💪",
    className: "strength",
    path: "/workout",
  },
  {
    number: "02",
    category: "CARDIO",
    title: "Move With Energy",
    description:
      "Improve cardiovascular fitness with walking, cycling, jogging, and active movement.",
    duration: "20–30 min",
    level: "All fitness levels",
    icon: "🏃",
    className: "cardio",
    path: "/workout",
  },
  {
    number: "03",
    category: "RECOVERY",
    title: "Stretch & Recover",
    description:
      "Support mobility and flexibility with gentle stretching and planned recovery sessions.",
    duration: "10–20 min",
    level: "Relaxed pace",
    icon: "🧘",
    className: "recovery",
    path: "/workout",
  },
];

const dailyHabits = [
  {
    number: "01",
    title: "Move Your Body",
    description:
      "Make time for a workout, a walk, or any physical activity you enjoy.",
    icon: "🏋️",
  },
  {
    number: "02",
    title: "Fuel Your Day",
    description:
      "Choose balanced meals with vegetables, protein, whole grains, and variety.",
    icon: "🥗",
  },
  {
    number: "03",
    title: "Stay Hydrated",
    description:
      "Drink water regularly throughout the day and adjust your intake to your needs.",
    icon: "💧",
  },
  {
    number: "04",
    title: "Rest & Recharge",
    description:
      "Make sleep and recovery part of your routine so you can feel ready for tomorrow.",
    icon: "🌙",
  },
];

const weeklyPlan = [
  { day: "MON", activity: "Full Body", type: "Strength", active: true },
  { day: "TUE", activity: "Brisk Walk", type: "Cardio", active: false },
  { day: "WED", activity: "Upper Body", type: "Strength", active: true },
  { day: "THU", activity: "Mobility", type: "Recovery", active: false },
  { day: "FRI", activity: "Lower Body", type: "Strength", active: true },
  { day: "SAT", activity: "Outdoor Activity", type: "Cardio", active: false },
  { day: "SUN", activity: "Rest & Reset", type: "Recovery", active: false },
];

export default function Home({ onNavigate }) {
  return (
    <div className="fitnova-home">
      <div className="fitnova-home-container">
        {/* HERO */}
        <Hero onNavigate={onNavigate} />

        {/* INTRODUCTION */}
        <section className="home-intro-section">
          <div className="home-intro-copy">
            <span className="home-eyebrow">WELCOME TO FITNOVA</span>
            <h2>
              Fitness that fits
              <br />
              <span>your everyday life.</span>
            </h2>
          </div>

          <p>
            You don't need a perfect routine to make progress. FitNova helps
            you bring workouts, nutrition, hydration, and recovery together
            into a practical lifestyle you can build one day at a time.
          </p>
        </section>

        {/* DAILY STATS */}
        <section className="home-stats-section">
          <div className="home-section-heading">
            <span className="home-eyebrow">YOUR DAILY MOTIVATION</span>
            <h2>
              Small Steps.
              <br />
              <span>Lasting Results.</span>
            </h2>
            <p>
              Focus on your daily habits and make steady progress toward
              a healthier lifestyle. Consistency matters more than perfection.
            </p>
          </div>

          <FloatingStats />
        </section>

        {/* WORKOUT PROGRAMS */}
        <section className="home-program-section" id="home-programs">
          <div className="home-section-top">
            <div>
              <span className="home-eyebrow">FIND YOUR MOVEMENT</span>
              <h2 className="home-section-title">
                Training for <span>every goal.</span>
              </h2>
              <p className="home-section-description">
                Choose a starting point that works for your schedule, energy,
                and current fitness level.
              </p>
            </div>

            <HomePageLink onNavigate={onNavigate} to="/workout" className="home-text-link">
              Explore workouts <span>↗</span>
            </HomePageLink>
          </div>

          <div className="home-program-grid">
            {workoutPrograms.map((program) => (
              <article
                className={`home-program-card ${program.className}`}
                key={program.number}
              >
                <div className="home-program-card-top">
                  <span className="home-program-number">
                    {program.number}
                  </span>
                  <span className="home-program-icon" aria-hidden="true">
                    {program.icon}
                  </span>
                </div>

                <span className="home-program-category">
                  {program.category}
                </span>

                <h3>{program.title}</h3>
                <p>{program.description}</p>

                <div className="home-program-meta">
                  <span>{program.duration}</span>
                  <span>{program.level}</span>
                </div>

                <HomePageLink onNavigate={onNavigate} to={program.path} className="home-program-link">
                  View workout <span>→</span>
                </HomePageLink>
              </article>
            ))}
          </div>
        </section>

        {/* EXISTING FEATURE CARDS */}
        <section className="home-feature-wrapper">
          <div className="home-section-top">
            <div>
              <span className="home-eyebrow">YOUR FITNESS TOOLKIT</span>
              <h2 className="home-section-title">
                Everything in <span>one place.</span>
              </h2>
              <p className="home-section-description">
                Keep your fitness essentials organised so you can spend less
                time planning and more time building healthy habits.
              </p>
            </div>
          </div>

          <FeatureCards onNavigate={onNavigate} />
        </section>

        {/* WEEKLY PLAN */}
        <section className="home-weekly-section">
          <div className="home-weekly-copy">
            <span className="home-eyebrow">MAKE A PLAN</span>
            <h2>
              A little structure.
              <br />
              <span>A lot more consistency.</span>
            </h2>
            <p>
              Give your week a simple rhythm. Alternate strength, cardio,
              and recovery instead of trying to do everything at once.
              Adjust the schedule to your goals, experience, and available time.
            </p>

            <ul className="home-weekly-benefits">
              <li>
                <span>✓</span> Plan activity around your schedule
              </li>
              <li>
                <span>✓</span> Balance training and recovery
              </li>
              <li>
                <span>✓</span> Make room for rest days
              </li>
            </ul>

            <HomePageLink onNavigate={onNavigate} to="/calendar" className="home-primary-link">
              Plan your week <span>→</span>
            </HomePageLink>
          </div>

          <div className="home-weekly-board">
            <div className="home-weekly-board-header">
              <div>
                <span className="home-board-label">SAMPLE ROUTINE</span>
                <h3>Your week at a glance</h3>
              </div>
              <span className="home-board-icon" aria-hidden="true">
                ▦
              </span>
            </div>

            <div className="home-weekly-list">
              {weeklyPlan.map((item) => (
                <div className="home-weekly-row" key={item.day}>
                  <span className="home-weekly-day">{item.day}</span>

                  <span
                    className={`home-weekly-indicator ${
                      item.active ? "is-training" : "is-recovery"
                    }`}
                    aria-hidden="true"
                  />

                  <div className="home-weekly-activity">
                    <strong>{item.activity}</strong>
                    <span>{item.type}</span>
                  </div>

                  <span className="home-weekly-status">
                    {item.active ? "TRAIN" : "BALANCE"}
                  </span>
                </div>
              ))}
            </div>

            <p className="home-weekly-note">
              Example schedule · Adapt it to your needs and recovery.
            </p>
          </div>
        </section>

        {/* DAILY HABITS */}
        <section className="home-habits-section">
          <div className="home-section-heading">
            <span className="home-eyebrow">BEYOND THE WORKOUT</span>
            <h2>
              Stronger habits.
              <br />
              <span>Healthier everyday.</span>
            </h2>
            <p>
              Your overall wellbeing includes more than exercise. Start with
              manageable habits and build a routine that feels sustainable.
            </p>
          </div>

          <div className="home-habits-grid">
            {dailyHabits.map((habit) => (
              <article className="home-habit-card" key={habit.number}>
                <div className="home-habit-card-top">
                  <span className="home-habit-icon" aria-hidden="true">
                    {habit.icon}
                  </span>
                  <span className="home-habit-number">{habit.number}</span>
                </div>

                <h3>{habit.title}</h3>
                <p>{habit.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* PROGRESS MESSAGE */}
        <section className="home-progress-section">
          <div className="home-progress-visual" aria-hidden="true">
            <div className="home-progress-ring">
              <span>01</span>
              <small>DAY AT A TIME</small>
            </div>
            <span className="home-progress-orbit orbit-one" />
            <span className="home-progress-orbit orbit-two" />
          </div>

          <div className="home-progress-copy">
            <span className="home-eyebrow">PROGRESS, NOT PERFECTION</span>
            <h2>
              Every small effort
              <br />
              <span>moves you forward.</span>
            </h2>
            <p>
              Some days will feel easier than others. Focus on showing up,
              learning what works for you, and celebrating the small wins
              that help turn healthy choices into lasting habits.
            </p>

            <div className="home-progress-points">
              <div>
                <strong>Be consistent</strong>
                <span>Build a routine you can repeat.</span>
              </div>
              <div>
                <strong>Stay flexible</strong>
                <span>Adjust when life gets busy.</span>
              </div>
              <div>
                <strong>Notice your progress</strong>
                <span>Recognise effort beyond the numbers.</span>
              </div>
            </div>

            <HomePageLink onNavigate={onNavigate} to="/progress" className="home-text-link">
              Explore your progress <span>↗</span>
            </HomePageLink>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="home-cta-section">
          <div className="home-cta-content">
            <span className="home-eyebrow">YOUR NEXT CHAPTER STARTS NOW</span>
            <h2>
              Your Fitness Journey
              <br />
              <span>Starts Here.</span>
            </h2>
            <p>
              Set a meaningful goal, choose your next step, and start building
              a healthier routine at your own pace. Your journey is yours to
              shape.
            </p>

            <div className="home-cta-actions">
              <HomePageLink onNavigate={onNavigate} to="/workout" className="home-cta-button">
                Get Started <span>→</span>
              </HomePageLink>

              <HomePageLink onNavigate={onNavigate} to="/goals" className="home-cta-secondary">
                Set your goals
              </HomePageLink>
            </div>

            <div className="home-cta-note">
              <span>✓</span> Start small. Keep going. Build your own progress.
            </div>
          </div>
        </section>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}