import React from "react";
import { useAppNav } from "../context/NavContext";

export const PAGE_BY_PATH = {
  "/": "home",
  "/home": "home",
  "/dashboard": "dashboard",
  "/nutrition": "nutrition",
  "/workout": "workout",
  "/calendar": "calendar",
  "/progress": "progress",
  "/body-stats": "body-stats",
  "/water-intake": "water-intake",
  "/sleep": "sleep",
  "/supplements": "supplements",
  "/goals": "goals",
  "/reports": "reports",
  "/photos": "photos",
  "/settings": "settings",
  "/premium": "premium",
  "/about": "about",
  "/contact": "contact",
  "/terms": "about",
  "/privacy": "about",
};

export default function HomePageLink({ to, onNavigate, children, onClick, ...props }) {
  const contextNavigate = useAppNav();
  const go = onNavigate || contextNavigate;
  function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const pageId = PAGE_BY_PATH[to];
    if (pageId && go) {
      event.preventDefault();
      go(pageId);
    }
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
