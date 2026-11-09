
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Timer,
  Zap,
} from "lucide-react";

import "../styles/Workout.css";

const categories = ["All Workouts", "Strength", "Cardio", "Flexibility"];

const workouts = [
  {
    id: 1,
    title: "Full Body Strength",
    category: "Strength",
    level: "Beginner",
    duration: "35 min",
    exercises: 8,
    description:
      "Build a strong foundation with balanced exercises for your entire body.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85",
    accent: "green",
    icon: Dumbbell,
  },
  {
    id: 2,
    title: "Cardio Burn",
    category: "Cardio",
    level: "Intermediate",
    duration: "25 min",
    exercises: 6,
    description:
      "Raise your heart rate and improve endurance with an energetic session.",
    image:
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=85",
    accent: "orange",
    icon: HeartPulse,
  },
  {
    id: 3,
    title: "Stretch & Mobility",
    category: "Flexibility",
    level: "All levels",
    duration: "15 min",
    exercises: 7,
    description:
      "Move comfortably with a gentle routine focused on flexibility and mobility.",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
    accent: "purple",
    icon: Activity,
  },
  {
    id: 4,
    title: "Upper Body Power",
    category: "Strength",
    level: "Intermediate",
    duration: "30 min",
    exercises: 7,
    description:
      "Train your chest, shoulders, back and arms with a focused strength session.",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
    accent: "blue",
    icon: Dumbbell,
  },
  {
    id: 5,
    title: "Endurance Run",
    category: "Cardio",
    level: "Beginner",
    duration: "20 min",
    exercises: 5,
    description:
      "Start at a comfortable pace and gradually build your cardiovascular endurance.",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85",
    accent: "orange",
    icon: Zap,
  },
  {
    id: 6,
    title: "Core & Balance",
    category: "Strength",
    level: "All levels",
    duration: "20 min",
    exercises: 6,
    description:
      "Improve core stability and body control with a simple, focused routine.",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85",
    accent: "green",
    icon: Target,
  },
];

const exercisePlan = [
  {
    number: "01",
    name: "Warm-up",
    detail: "Prepare your muscles and joints",
    duration: "5 min",
    icon: Activity,
  },
  {
    number: "02",
    name: "Main workout",
    detail: "Focus on controlled, steady movement",
    duration: "20 min",
    icon: Dumbbell,
  },
  {
    number: "03",
    name: "Cool-down",
    detail: "Slow down and stretch comfortably",
    duration: "5 min",
    icon: RotateCcw,
  },
];

const weeklySchedule = [
  { day: "MON", activity: "Full body", type: "Strength", status: "Train" },
  { day: "TUE", activity: "Brisk walk", type: "Cardio", status: "Move" },
  { day: "WED", activity: "Upper body", type: "Strength", status: "Train" },
  { day: "THU", activity: "Stretching", type: "Recovery", status: "Recover" },
  { day: "FRI", activity: "Core & balance", type: "Strength", status: "Train" },
  { day: "SAT", activity: "Outdoor cardio", type: "Cardio", status: "Move" },
  { day: "SUN", activity: "Rest day", type: "Recovery", status: "Rest" },
];

export default function WorkoutsPage({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState("All Workouts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [showPlan, setShowPlan] = useState(false);

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesCategory =
      activeCategory === "All Workouts" ||
      workout.category === activeCategory;

    const searchText =
      `${workout.title} ${workout.category} ${workout.level}`.toLowerCase();

    return matchesCategory && searchText.includes(searchTerm.toLowerCase());
  });

  const openWorkout = (workout) => {
    setSelectedWorkout(workout);
    setCompletedExercises([]);
  };

  const closeWorkout = () => {
    setSelectedWorkout(null);
    setCompletedExercises([]);
  };

  const toggleExercise = (id) => {
    setCompletedExercises((previous) =>
      previous.includes(id)
        ? previous.filter((exerciseId) => exerciseId !== id)
        : [...previous, id]
    );
  };

  const completion =
    selectedWorkout && selectedWorkout.exercises > 0
      ? Math.round(
          (completedExercises.length / selectedWorkout.exercises) * 100
        )
      : 0;

  return (
    <main className="fitnova-workout">
      <div className="workout-container">
        {/* PAGE INTRO */}
        <section className="workout-welcome">
          <div className="workout-welcome-copy">
            <span className="workout-eyebrow">
              <Sparkles size={15} />
              YOUR TRAINING SPACE
            </span>

            <h1>
              Make every
              <br />
              <span>move count.</span>
            </h1>

            <p>
              Find your rhythm, train at your own pace, and build a routine
              that helps you feel stronger every day.
            </p>

            <div className="workout-welcome-actions">
              <a href="#workout-library" className="workout-primary-button">
                Explore workouts <ArrowRight size={17} />
              </a>

              <a href="#weekly-schedule" className="workout-secondary-button">
                View weekly plan
              </a>
            </div>

            <div className="workout-trust-points">
              <span>
                <CheckCircle2 size={16} /> Flexible routines
              </span>
              <span>
                <CheckCircle2 size={16} /> All fitness levels
              </span>
            </div>
          </div>

          <div className="workout-welcome-visual">
           <img
  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85"
  alt="Athlete training with weights in a gym"
/>

            <div className="workout-visual-overlay" />

            <div className="workout-image-tag">
              <span className="workout-live-dot" />
              YOUR NEXT CHAPTER STARTS HERE
            </div>

            <div className="workout-image-stat">
              <span className="workout-image-stat-icon">
                <Flame size={19} />
              </span>
              <div>
                <strong>Stay consistent</strong>
                <span>One workout at a time</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK HIGHLIGHTS */}
        <section className="workout-highlights" aria-label="Workout highlights">
          <article className="workout-highlight">
            <span className="workout-highlight-icon highlight-green">
              <Dumbbell size={21} />
            </span>
            <div>
              <strong>{workouts.length}</strong>
              <span>Workout routines</span>
            </div>
          </article>

          <article className="workout-highlight">
            <span className="workout-highlight-icon highlight-blue">
              <Clock3 size={21} />
            </span>
            <div>
              <strong>15–35 min</strong>
              <span>Flexible sessions</span>
            </div>
          </article>

          <article className="workout-highlight">
            <span className="workout-highlight-icon highlight-purple">
              <Target size={21} />
            </span>
            <div>
              <strong>3 categories</strong>
              <span>Different training goals</span>
            </div>
          </article>

          <article className="workout-highlight">
            <span className="workout-highlight-icon highlight-orange">
              <HeartPulse size={21} />
            </span>
            <div>
              <strong>Your pace</strong>
              <span>Progress without pressure</span>
            </div>
          </article>
        </section>

        {/* WORKOUT LIBRARY */}
        <section className="workout-library" id="workout-library">
          <div className="workout-section-heading">
            <div>
              <span className="workout-eyebrow">FIND YOUR MOVEMENT</span>
              <h2>
                Choose your <span>workout.</span>
              </h2>
              <p>
                Explore different training styles and choose a routine that
                suits your goals, experience and available time.
              </p>
            </div>

            <div className="workout-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search workouts..."
                aria-label="Search workouts"
              />
            </div>
          </div>

          <div className="workout-filters" aria-label="Filter workouts">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category ? "filter-active" : ""
                }
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="workout-card-grid">
            {filteredWorkouts.map((workout) => {
              const Icon = workout.icon;

              return (
                <article
                  className={`workout-card workout-${workout.accent}`}
                  key={workout.id}
                >
                  <div className="workout-card-image">
                    <img src={workout.image} alt={workout.title} loading="lazy" />

                    <span className="workout-card-category">
                      {workout.category}
                    </span>

                    <span className="workout-card-image-icon">
                      <Icon size={20} />
                    </span>
                  </div>

                  <div className="workout-card-content">
                    <div className="workout-card-meta">
                      <span>
                        <Clock3 size={14} /> {workout.duration}
                      </span>
                      <span>{workout.level}</span>
                    </div>

                    <h3>{workout.title}</h3>
                    <p>{workout.description}</p>

                    <div className="workout-card-footer">
                      <span>{workout.exercises} exercises</span>
                      <button
                        type="button"
                        onClick={() => openWorkout(workout)}
                        aria-label={`View ${workout.title} workout`}
                      >
                        View workout <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredWorkouts.length === 0 && (
            <div className="workout-empty-state">
              <Search size={28} />
              <h3>No workouts found</h3>
              <p>Try a different search term or choose another category.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All Workouts");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* HOW TO BUILD A SESSION */}
        <section className="workout-session-section">
          <div className="workout-session-copy">
            <span className="workout-eyebrow">TRAIN WITH A PLAN</span>
            <h2>
              A smarter way
              <br />
              <span>to get moving.</span>
            </h2>
            <p>
              A balanced session doesn't have to be complicated. Prepare your
              body, focus on your main activity, and finish with a comfortable
              cool-down.
            </p>

            <button
              type="button"
              className="workout-primary-button"
              onClick={() => setShowPlan((previous) => !previous)}
              aria-expanded={showPlan}
            >
              {showPlan ? "Hide session guide" : "View session guide"}
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="workout-session-steps">
            {exercisePlan.map((step) => {
              const Icon = step.icon;

              return (
                <article className="workout-session-step" key={step.number}>
                  <span className="workout-step-number">{step.number}</span>

                  <span className="workout-step-icon">
                    <Icon size={21} />
                  </span>

                  <div className="workout-step-copy">
                    <h3>{step.name}</h3>
                    <p>{step.detail}</p>
                  </div>

                  <span className="workout-step-duration">
                    {step.duration}
                  </span>
                </article>
              );
            })}

            {showPlan && (
              <div className="workout-session-guide">
                <h3>Before you begin</h3>
                <ul>
                  <li>Choose a pace that matches your current fitness level.</li>
                  <li>Use controlled movements and comfortable ranges of motion.</li>
                  <li>Take breaks when needed and drink water regularly.</li>
                  <li>Stop if you feel pain, dizziness or unusual discomfort.</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* WEEKLY SCHEDULE */}
        <section className="workout-weekly-section" id="weekly-schedule">
          <div className="workout-section-heading">
            <div>
              <span className="workout-eyebrow">CONSISTENCY OVER PERFECTION</span>
              <h2>
                Your weekly <span>rhythm.</span>
              </h2>
              <p>
                Use this sample schedule as a starting point. Adapt the
                activities and rest days to your needs.
              </p>
            </div>

            <span className="workout-schedule-label">
              <Activity size={16} /> Sample plan
            </span>
          </div>

          <div className="workout-weekly-board">
            {weeklySchedule.map((item) => (
              <article
                className={`workout-day workout-day-${item.status.toLowerCase()}`}
                key={item.day}
              >
                <span className="workout-day-name">{item.day}</span>
                <div className="workout-day-info">
                  <strong>{item.activity}</strong>
                  <span>{item.type}</span>
                </div>
                <span className="workout-day-status">{item.status}</span>
              </article>
            ))}
          </div>
        </section>

        {/* MOTIVATION BANNER */}
        <section className="workout-motivation">
          <div className="workout-motivation-icon">
            <Zap size={25} />
          </div>

          <div className="workout-motivation-copy">
            <span className="workout-eyebrow">YOUR JOURNEY, YOUR RULES</span>
            <h2>Progress begins with showing up.</h2>
            <p>
              Start small, keep your routine realistic, and celebrate the
              healthy habits you build along the way.
            </p>
          </div>

          <button type="button" onClick={() => onNavigate?.("home")} className="workout-motivation-link">
            Back to Home <ArrowRight size={17} />
          </button>
        </section>

        {/* WORKOUT DETAIL MODAL */}
        {selectedWorkout && (
          <div
            className="workout-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeWorkout();
            }}
          >
            <section
              className="workout-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="workout-modal-title"
            >
              <button
                type="button"
                className="workout-modal-close"
                onClick={closeWorkout}
                aria-label="Close workout details"
              >
                ×
              </button>

              <span className="workout-eyebrow">
                <Play size={14} /> WORKOUT DETAILS
              </span>

              <h2 id="workout-modal-title">{selectedWorkout.title}</h2>
              <p>{selectedWorkout.description}</p>

              <div className="workout-modal-summary">
                <span>
                  <Clock3 size={16} /> {selectedWorkout.duration}
                </span>
                <span>
                  <Dumbbell size={16} /> {selectedWorkout.exercises} exercises
                </span>
                <span>
                  <Timer size={16} /> {selectedWorkout.level}
                </span>
              </div>

              <div className="workout-modal-progress">
                <div>
                  <strong>Session checklist</strong>
                  <span>
                    {completedExercises.length} of {selectedWorkout.exercises}{" "}
                    completed
                  </span>
                </div>
                <strong>{completion}%</strong>
              </div>

              <div
                className="workout-progress-track"
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Workout completion"
              >
                <span style={{ width: `${completion}%` }} />
              </div>

              <div className="workout-checklist">
                {Array.from(
                  { length: selectedWorkout.exercises },
                  (_, index) => {
                    const exerciseId = index + 1;
                    const isComplete = completedExercises.includes(exerciseId);

                    return (
                      <button
                        type="button"
                        className={`workout-checklist-item ${
                          isComplete ? "exercise-complete" : ""
                        }`}
                        key={exerciseId}
                        onClick={() => toggleExercise(exerciseId)}
                        aria-pressed={isComplete}
                      >
                        <span className="workout-check-circle">
                          {isComplete && <CheckCircle2 size={18} />}
                        </span>
                        <span>
                          {index === 0
                            ? "Prepare and warm up"
                            : index === selectedWorkout.exercises - 1
                              ? "Cool down and stretch"
                              : `Exercise ${String(index + 1).padStart(2, "0")}`}
                        </span>
                        <span>{isComplete ? "Done" : "Mark done"}</span>
                      </button>
                    );
                  }
                )}
              </div>

              {completion === 100 && (
                <div className="workout-complete-message">
                  <CheckCircle2 size={19} />
                  Great work! You've completed this session checklist.
                </div>
              )}

              <p className="workout-modal-note">
                This checklist tracks your progress in this open session only.
                It is not saved to a database.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
