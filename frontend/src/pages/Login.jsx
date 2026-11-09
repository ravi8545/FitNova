
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import BrandMark from "../components/BrandMark";
import "../styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });

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

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          username: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.email?.[0] || data.username?.[0] || data.password?.[0] || "Login failed. Please check credentials.");
      }

      const accessToken = data.access || data.tokens?.access;
      const refreshToken = data.refresh || data.tokens?.refresh;
      const userObj = data.user || data.data?.user;

      if (accessToken) {
        localStorage.setItem("fitnova_auth_token", accessToken);
        if (refreshToken) localStorage.setItem("fitnova_refresh_token", refreshToken);
        if (userObj) localStorage.setItem("fitnova_user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("fitnova_auth_changed"));
        navigate("/");
      } else {
        throw new Error("No access token received from server.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <BrandMark size={38} />
          <span>FitNova</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">WELCOME BACK</span>
          <h1>Good to see you again.</h1>
          <p>Sign in to continue your fitness journey.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <label htmlFor="login-email">Email address</label>
          <div className="auth-input-wrap">
            <Mail size={18} />
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-label-row">
            <label htmlFor="login-password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <div className="auth-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
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

          <label className="auth-checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <span>Remember me</span>
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing In..." : <>Sign In <span>→</span></>}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>

        <div className="auth-bottom-note">
          <LockKeyhole size={14} />
          Your fitness journey, your way.
        </div>
      </section>
    </main>
  );
}
