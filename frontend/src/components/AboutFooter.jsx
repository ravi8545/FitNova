import HomePageLink from "./HomePageLink";
import BrandMark from "./BrandMark";
import { siteConfig } from "../services/siteConfig";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="fitnova-footer">
      <div className="footer-brand">
        <BrandMark size={28} />
        {siteConfig.name}
      </div>

      <p>{siteConfig.tagline}</p>

      <nav className="footer-links" aria-label="Footer">
        <HomePageLink to="/">Home</HomePageLink>
        <HomePageLink to="/about">About Us</HomePageLink>
        <HomePageLink to="/contact">Contact</HomePageLink>
      </nav>

      <span className="footer-copyright">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </span>
    </footer>
  );
}
