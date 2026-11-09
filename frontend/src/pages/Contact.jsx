import { useRef, useState } from "react";
import HomePageLink from "../components/HomePageLink";
import { Mail, Plus, Clock, CheckCircle2 } from "lucide-react";
import Footer from "../components/AboutFooter";
import { images } from "../services/siteConfig";
import "../styles/Contact.css";

const topics = [
  "General question",
  "Membership & pricing",
  "Classes & schedule",
  "Personal training",
  "Feedback",
  "Report a problem",
];

const emptyForm = { name: "", email: "", topic: topics[0], message: "" };

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [sent, setSent] = useState(false);
  const messageRef = useRef(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO (backend teammate): send `form` to your API here.
    console.log("Contact form submitted:", form);
    setSent(true);
    setForm(emptyForm);
  };

  const focusMessage = (topic) => {
    setSent(false);
    if (topic) setForm((prev) => ({ ...prev, topic }));
    setTimeout(() => messageRef.current?.focus(), 0);
  };

  return (
    <main className="page-shell">
      <div className="page-container">
        {/* HERO */}
        <section className="ct-hero">
          <div className="ct-hero-text">
            <p className="ct-eyebrow">Support channel</p>
            <h1>How can we help?</h1>
            <p className="ct-lead">
              Questions about memberships, classes, trainers, or a little
              guidance with your routine — send a note and our team will take it
              from here.
            </p>
          </div>
          <div className="ct-hero-img">
            <img src={images.training} alt="Person training in a gym" />
          </div>
        </section>

        <div className="ct-grid">
          {/* FORM */}
          <section className="ct-card">
            <div className="ct-card-head">
              <div>
                <h2>Send us a message</h2>
                <p>
                  Tell us what you need and we'll point you in the right
                  direction.
                </p>
              </div>
              <span className="ct-step">{sent ? "02 / 02" : "01 / 02"}</span>
            </div>

            {sent ? (
              <div className="ct-success">
                <CheckCircle2 size={34} />
                <h3>Message sent</h3>
                <p>
                  Thanks for reaching out. We usually reply within 24 hours.
                </p>
                <button
                  type="button"
                  className="ct-btn"
                  onClick={() => focusMessage()}
                >
                  Send another message <span>→</span>
                </button>
              </div>
            ) : (
              <form className="ct-form" onSubmit={handleSubmit}>
                <div className="ct-row">
                  <div className="ct-field">
                    <label htmlFor="name">Your name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Alex"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="ct-field">
                    <label htmlFor="email">Email address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="ct-field">
                  <label htmlFor="topic">What can we help with?</label>
                  <div className="ct-select">
                    <select
                      id="topic"
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                    >
                      {topics.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ct-field">
                  <label htmlFor="message">Your message</label>
                  <textarea
                    id="message"
                    name="message"
                    ref={messageRef}
                    placeholder="Tell us a little more..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ct-form-foot">
                  <p>Your message stays within the gym's support channel.</p>
                  <button type="submit" className="ct-btn">
                    Send message <span>→</span>
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* RIGHT COLUMN */}
          <div className="ct-side">
            <section className="ct-card ct-quick">
              <h2>Quick support</h2>
              <p className="ct-muted">
                Choose the path that best matches what you need today.
              </p>

              <button
                type="button"
                className="ct-q-item"
                onClick={() => focusMessage()}
              >
                <span className="ct-q-icon green">
                  <Mail size={13} />
                </span>
                <span>
                  <b>Message support</b>
                  <small>
                    For account questions, bugs, and personal guidance.{" "}
                    <em>Start a message →</em>
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="ct-q-item"
                onClick={() => focusMessage("Feedback")}
              >
                <span className="ct-q-icon violet">
                  <Plus size={13} />
                </span>
                <span>
                  <b>Share feedback</b>
                  <small>
                    Help shape a calmer, stronger gym experience.{" "}
                    <em>Share feedback →</em>
                  </small>
                </span>
              </button>

              <HomePageLink to="/about" className="ct-q-item">
                <span className="ct-q-icon teal">
                  <Clock size={13} />
                </span>
                <span>
                  <b>Browse common topics</b>
                  <small>
                    Start with your account, routine, or progress question.{" "}
                    <em>View topics →</em>
                  </small>
                </span>
              </HomePageLink>
            </section>

            <section className="ct-card ct-status">
              <h2>Support status</h2>
              <dl>
                <div>
                  <dt>
                    <i className="ct-live" />
                    Support channel
                  </dt>
                  <dd>Available</dd>
                </div>
                <div>
                  <dt>Preferred language</dt>
                  <dd>English</dd>
                </div>
                <div>
                  <dt>Message type</dt>
                  <dd>Private</dd>
                </div>
                <div>
                  <dt>Typical reply</dt>
                  <dd>Within 24 hrs</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>

        {/* GALLERY */}
        <section className="ct-gallery">
          <img src={images.gymFloor} alt="Gym floor" loading="lazy" />
          <img src={images.weights} alt="Free weights" loading="lazy" />
          <img src={images.session} alt="Training session" loading="lazy" />
        </section>
      </div>

      <Footer />
    </main>
  );
}
