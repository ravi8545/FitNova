
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import BrandMark from "../components/BrandMark";
import "../styles/Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!form.terms) {
      setError("Please accept the terms to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          first_name: form.name.trim().split(" ")[0] || form.name.trim(),
          last_name: form.name.trim().split(" ").slice(1).join(" "),
          email: form.email.trim(),
          password: form.password,
          password_confirm: form.confirmPassword,
          confirm_password: form.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.email?.[0] || data.password?.[0] || data.username?.[0] || data.detail || "Registration failed.";
        throw new Error(errorMsg);
      }

      // Auto login right after registration
      try {
        const loginRes = await fetch("http://127.0.0.1:8000/api/auth/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        });
        const loginData = await loginRes.json();
        const accessToken = loginData.access || loginData.tokens?.access;
        const refreshToken = loginData.refresh || loginData.tokens?.refresh;
        const userObj = loginData.user || loginData.data?.user;
        if (accessToken) {
          localStorage.setItem("fitnova_auth_token", accessToken);
          if (refreshToken) localStorage.setItem("fitnova_refresh_token", refreshToken);
          if (userObj) localStorage.setItem("fitnova_user", JSON.stringify(userObj));
          window.dispatchEvent(new Event("fitnova_auth_changed"));
          navigate("/");
          return;
        }
      } catch (loginErr) {
        // Fallback to login page
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page register-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <section className="auth-card register-card">
        <Link to="/" className="auth-brand">
          <BrandMark size={38} />
          <span>FitNova</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">START SOMETHING GOOD</span>
          <h1>Create your account.</h1>
          <p>Build healthier habits, one day at a time.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <label htmlFor="register-name">Full name</label>
          <div className="auth-input-wrap">
            <UserRound size={18} />
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <label htmlFor="register-email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={18} />
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="register-password">Password</label>
          <div className="auth-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label htmlFor="register-confirm">Confirm password</label>
          <div className="auth-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="register-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Enter your password again"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
            />
            <span>
              I agree to the <Link to="/terms">Terms</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : <>Create Account <span>→</span></>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <div className="auth-bottom-note">
          <LockKeyhole size={14} />
          Your fitness journey, your way.
        </div>
      </section>
    </main>
  );
}
