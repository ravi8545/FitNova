import HomePageLink from "../components/HomePageLink";
import { Users, HeartPulse, Scale, Sparkles, ArrowRight } from "lucide-react";
import Footer from "../components/AboutFooter";
import { images, siteConfig } from "../services/siteConfig";
import "../styles/About.css";

const values = [
  { icon: Users, title: "Community first", text: "A welcoming space where every member, from first-timers to athletes, feels at home." },
  { icon: HeartPulse, title: "Health over hype", text: "Sustainable habits and honest guidance instead of quick fixes." },
  { icon: Scale, title: "Balance", text: "Training, nutrition, hydration and recovery working together." },
  { icon: Sparkles, title: "Progress, your way", text: "Goals that fit your life, and support when life gets busy." },
];

const gallery = [images.gymFloor, images.weights, images.session];

export default function About() {
  return (
    <main className="page-shell">
      <div className="page-container">
        {/* HERO */}
        <section className="ab-hero">
          <div>
            <p className="ab-eyebrow">About us</p>
            <h1>
              A gym built around <span>real people.</span>
            </h1>
            <p className="ab-lead">
              {siteConfig.name} brings workouts, nutrition and daily habits
              together so everyone can build a healthier routine, one day at a
              time. Replace this text with your gym's own story.
            </p>
            <HomePageLink to="/contact" className="ab-btn">
              Talk to our team <ArrowRight size={15} />
            </HomePageLink>
          </div>
          <img src={images.training} alt="Member training at the gym" />
        </section>

        {/* VALUES */}
        <section className="ab-section">
          <p className="ab-eyebrow">What we believe</p>
          <h2>Our values</h2>
          <div className="ab-values">
            {values.map(({ icon: Icon, title, text }) => (
              <article key={title} className="ab-value">
                <span><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* STORY + GALLERY */}
        <section className="ab-section ab-story">
          <div>
            <p className="ab-eyebrow">Our space</p>
            <h2>Train in a place that feels good.</h2>
            <p className="ab-text">
              Modern equipment, flexible training areas and a supportive team.
              Add details here: opening hours, facilities, classes, location.
            </p>
          </div>
          <div className="ab-gallery">
            {gallery.map((src, i) => (
              <img key={i} src={src} alt="Inside the gym" loading="lazy" />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
