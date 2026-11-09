
import { useEffect, useState } from "react";
import "../styles/settings.css";

const defaultSettings = {
  darkMode: true,
  language: "English",
  units: "Metric",
  sounds: true,
  workoutReminders: true,
  restReminders: false,
  weeklySummary: true,
  pushNotifications: true,
  emailNotifications: true,
  dailySteps: 8000,
  waterGoal: 3,
  weeklyWorkouts: 5,
};

const defaultProfile = {
  fullName: "Akash",
  email: "akash@example.com",
  phone: "",
  height: "",
  weight: "",
  targetWeight: "",
  fitnessGoal: "Build Muscle",
};


const menuItems = [
  { icon: "⌂", label: "Dashboard" },
  { icon: "♜", label: "Nutrition" },
  { icon: "🏋", label: "Workout" },
  { icon: "▣", label: "Checkout" },
  { icon: "▢", label: "Checkout" },
  { icon: "♧", label: "Body Stats" },
  { icon: "♢", label: "Water Intake" },
  { icon: "☾", label: "Sleep" },
  { icon: "◇", label: "Supplements" },
  { icon: "♡", label: "Goals" },
  { icon: "▧", label: "Pilates" },
  { icon: "▤", label: "Reports" },
  { icon: "⚙", label: "Settings" },
];


// Reusable toggle for all settings.
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`setting-toggle ${checked ? "active" : ""}`}
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

// Reusable row for a setting.
function SettingRow({ icon, title, description, children }) {
  return (
    <div className="setting-row">
      <div className="setting-icon">{icon}</div>

      <div className="setting-info">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <div className="setting-control">{children}</div>
    </div>
  );
}

function Settings() {
  const [activeTab, setActiveTab] = useState("Profile");

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("fitnova-settings");
      return saved
        ? { ...defaultSettings, ...JSON.parse(saved) }
        : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("fitnova-profile");
      return saved
        ? { ...defaultProfile, ...JSON.parse(saved) }
        : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  const [message, setMessage] = useState("");

  // Keep the preference on <html data-theme>. The visual theme is dark across all pages.
  useEffect(() => {
    document.documentElement.dataset.theme =
      settings.darkMode ? "dark" : "light";
  }, [settings.darkMode]);

  // Change a setting immediately in React state.
  function updateSetting(name, value) {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  // Update profile form fields.
  function updateProfile(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  // Save settings and profile in this browser.
  function handleSave() {
    try {
      localStorage.setItem(
        "fitnova-settings",
        JSON.stringify(settings)
      );

      localStorage.setItem(
        "fitnova-profile",
        JSON.stringify(profile)
      );

      setMessage("Changes saved successfully!");
    } catch {
      setMessage("Unable to save changes in this browser.");
    }
  }

  function handleAction(action) {
    setMessage(`${action} will be available in a future update.`);
  }

  function renderProfileTab() {
    return (
      <div className="settings-columns">
        <section className="settings-panel">
          <h2>General Settings</h2>

          <SettingRow
            icon="🌙"
            title="Dark Mode"
            description="FitNova uses one dark theme across every page"
          >
            <Toggle
              label="Dark Mode"
              checked={settings.darkMode}
              onChange={(value) => updateSetting("darkMode", value)}
            />
          </SettingRow>

          <SettingRow
            icon="🌐"
            title="Language"
            description="Choose your preferred language"
          >
            <select
              value={settings.language}
              onChange={(event) =>
                updateSetting("language", event.target.value)
              }
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </SettingRow>

          <SettingRow
            icon="📏"
            title="Measurement Units"
            description="Choose your measurement system"
          >
            <select
              value={settings.units}
              onChange={(event) =>
                updateSetting("units", event.target.value)
              }
            >
              <option>Metric</option>
              <option>Imperial</option>
            </select>
          </SettingRow>

          <SettingRow
            icon="🔊"
            title="Sounds & Haptics"
            description="Enable or disable interface sounds"
          >
            <Toggle
              label="Sounds and haptics"
              checked={settings.sounds}
              onChange={(value) => updateSetting("sounds", value)}
            />
          </SettingRow>

          <SettingRow
            icon="🏋️"
            title="Workout Reminders"
            description="Reminders for scheduled workouts"
          >
            <Toggle
              label="Workout reminders"
              checked={settings.workoutReminders}
              onChange={(value) =>
                updateSetting("workoutReminders", value)
              }
            />
          </SettingRow>

          <SettingRow
            icon="🛌"
            title="Rest Day Reminders"
            description="Remember your recovery days"
          >
            <Toggle
              label="Rest day reminders"
              checked={settings.restReminders}
              onChange={(value) =>
                updateSetting("restReminders", value)
              }
            />
          </SettingRow>

          <SettingRow
            icon="📊"
            title="Weekly Progress Summary"
            description="Review your weekly fitness progress"
          >
            <Toggle
              label="Weekly progress summary"
              checked={settings.weeklySummary}
              onChange={(value) =>
                updateSetting("weeklySummary", value)
              }
            />
          </SettingRow>
        </section>

        <div className="settings-right-column">
          <section className="settings-panel">
            <h2>Account Management</h2>

            <button
              className="action-row"
              onClick={() => handleAction("Change password")}
            >
              <span>🔒</span>
              <span>Change Password</span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="action-row"
              onClick={() => setActiveTab("Notifications")}
            >
              <span>📧</span>
              <span>Email Preferences</span>
              <span className="action-arrow">›</span>
            </button>

            <button
              className="action-row danger-action"
              onClick={() => handleAction("Delete account")}
            >
              <span>🗑️</span>
              <span>Delete Account</span>
              <span className="action-arrow">›</span>
            </button>
          </section>

          <section className="settings-panel">
            <h2>Other</h2>

            <div className="other-actions">
              <button onClick={() => handleAction("Help & Support")}>
                Help & Support
              </button>

              <button onClick={() => handleAction("Privacy Policy")}>
                Privacy Policy
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  function renderAccountTab() {
    return (
      <section className="settings-panel full-panel">
        <h2>Personal Information</h2>

        <div className="profile-avatar">👤</div>

        <div className="settings-form">
          <label>
            Full Name
            <input
              name="fullName"
              value={profile.fullName}
              onChange={updateProfile}
              placeholder="Enter your name"
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={updateProfile}
              placeholder="Enter your email"
            />
          </label>

          <label>
            Phone Number
            <input
              name="phone"
              value={profile.phone}
              onChange={updateProfile}
              placeholder="Enter phone number"
            />
          </label>

          <label>
            Height (cm)
            <input
              type="number"
              name="height"
              value={profile.height}
              onChange={updateProfile}
              placeholder="e.g. 175"
            />
          </label>

          <label>
            Current Weight (kg)
            <input
              type="number"
              name="weight"
              value={profile.weight}
              onChange={updateProfile}
              placeholder="e.g. 75"
            />
          </label>

          <label>
            Target Weight (kg)
            <input
              type="number"
              name="targetWeight"
              value={profile.targetWeight}
              onChange={updateProfile}
              placeholder="e.g. 70"
            />
          </label>

          <label>
            Fitness Goal
            <select
              name="fitnessGoal"
              value={profile.fitnessGoal}
              onChange={updateProfile}
            >
              <option>Build Muscle</option>
              <option>Lose Weight</option>
              <option>Improve Endurance</option>
              <option>Stay Fit</option>
            </select>
          </label>
        </div>
      </section>
    );
  }

  function renderNotificationsTab() {
    return (
      <section className="settings-panel full-panel">
        <h2>Notification Preferences</h2>

        <SettingRow
          icon="🏋️"
          title="Workout Reminders"
          description="Reminders for scheduled workouts"
        >
          <Toggle
            label="Workout reminders"
            checked={settings.workoutReminders}
            onChange={(value) =>
              updateSetting("workoutReminders", value)
            }
          />
        </SettingRow>

        <SettingRow
          icon="📊"
          title="Weekly Progress Report"
          description="Receive your weekly fitness overview"
        >
          <Toggle
            label="Weekly progress report"
            checked={settings.weeklySummary}
            onChange={(value) =>
              updateSetting("weeklySummary", value)
            }
          />
        </SettingRow>

        <SettingRow
          icon="📱"
          title="Push Notifications"
          description="Control app notification preferences"
        >
          <Toggle
            label="Push notifications"
            checked={settings.pushNotifications}
            onChange={(value) =>
              updateSetting("pushNotifications", value)
            }
          />
        </SettingRow>

        <SettingRow
          icon="📧"
          title="Email Notifications"
          description="Control email notification preferences"
        >
          <Toggle
            label="Email notifications"
            checked={settings.emailNotifications}
            onChange={(value) =>
              updateSetting("emailNotifications", value)
            }
          />
        </SettingRow>

        <SettingRow
          icon="🛌"
          title="Rest Day Reminders"
          description="Reminders for recovery days"
        >
          <Toggle
            label="Rest day reminders"
            checked={settings.restReminders}
            onChange={(value) =>
              updateSetting("restReminders", value)
            }
          />
        </SettingRow>
      </section>
    );
  }

  function renderPreferencesTab() {
    return (
      <section className="settings-panel full-panel">
        <h2>App Preferences</h2>

        <SettingRow
          icon="🌙"
          title="Dark Mode"
          description="FitNova uses one dark theme across every page"
        >
          <Toggle
            label="Dark Mode"
            checked={settings.darkMode}
            onChange={(value) => updateSetting("darkMode", value)}
          />
        </SettingRow>

        <SettingRow
          icon="🌐"
          title="Language"
          description="Choose your preferred language"
        >
          <select
            value={settings.language}
            onChange={(event) =>
              updateSetting("language", event.target.value)
            }
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
          </select>
        </SettingRow>

        <SettingRow
          icon="📏"
          title="Measurement Units"
          description="Choose Metric or Imperial"
        >
          <select
            value={settings.units}
            onChange={(event) =>
              updateSetting("units", event.target.value)
            }
          >
            <option>Metric</option>
            <option>Imperial</option>
          </select>
        </SettingRow>

        <SettingRow
          icon="👟"
          title="Daily Step Goal"
          description="Set your daily step target"
        >
          <input
            className="small-number-input"
            type="number"
            min="1000"
            value={settings.dailySteps}
            onChange={(event) =>
              updateSetting("dailySteps", Number(event.target.value))
            }
          />
        </SettingRow>

        <SettingRow
          icon="💧"
          title="Daily Water Goal"
          description="Daily target in litres"
        >
          <input
            className="small-number-input"
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={settings.waterGoal}
            onChange={(event) =>
              updateSetting("waterGoal", Number(event.target.value))
            }
          />
        </SettingRow>

        <SettingRow
          icon="📅"
          title="Weekly Workout Goal"
          description="Target workouts per week"
        >
          <input
            className="small-number-input"
            type="number"
            min="1"
            max="14"
            value={settings.weeklyWorkouts}
            onChange={(event) =>
              updateSetting("weeklyWorkouts", Number(event.target.value))
            }
          />
        </SettingRow>
      </section>
    );
  }

  return (
    <div className="settings-layout settings-page">
      <div className="settings-main">
        <header className="settings-header">
          <div>
            <p className="page-eyebrow">FITNOVA / ACCOUNT</p>
            <h1>Settings</h1>
            <p>Manage your profile and personalize your experience.</p>
          </div>

          <div className="header-avatar" aria-hidden="true">
            {(profile.fullName?.trim().charAt(0) || "M").toUpperCase()}
          </div>
        </header>

        <section className="gym-banner">
          <div className="gym-banner-content">
            <span className="banner-label">YOUR FITNESS JOURNEY</span>
            <h2>Make your fitness experience yours.</h2>
            <p>Update your preferences and stay focused on your goals.</p>
          </div>
        </section>

        <section className="settings-content">
          <h2>Personal Settings</h2>
          <p>Choose your preferences and manage your account.</p>

          <nav className="settings-tabs" aria-label="Settings sections">
            {["Profile", "Account", "Notifications", "App Preferences"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  className={activeTab === tab ? "selected" : ""}
                  aria-current={activeTab === tab ? "page" : undefined}
                  onClick={() => {
                    setActiveTab(tab);
                    setMessage("");
                  }}
                >
                  {tab}
                </button>
              )
            )}
          </nav>

          {activeTab === "Profile" && renderProfileTab()}
          {activeTab === "Account" && renderAccountTab()}
          {activeTab === "Notifications" && renderNotificationsTab()}
          {activeTab === "App Preferences" && renderPreferencesTab()}

          <footer className="settings-footer">
            <p role="status">{message}</p>

            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}




export default Settings;
