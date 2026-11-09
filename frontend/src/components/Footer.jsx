import HomePageLink from "./HomePageLink";
import BrandMark from "./BrandMark";

export default function Footer({ onNavigate }) {
  return (
    <footer className="fitnova-footer">
      <HomePageLink onNavigate={onNavigate} to="/" className="footer-brand">
        <BrandMark size={28} />
        <span>FitNova</span>
      </HomePageLink>

      <p>Build healthy habits. Keep moving forward.</p>

      <div className="footer-links">
        <HomePageLink onNavigate={onNavigate} to="/terms">Terms</HomePageLink>
        <HomePageLink onNavigate={onNavigate} to="/privacy">Privacy</HomePageLink>
      </div>

      <span className="footer-copyright">
        © {new Date().getFullYear()} FitNova
      </span>
    </footer>
  );
}