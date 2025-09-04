// components/Nav.jsx
import React, { useState, useEffect } from "react";
import "./Nav.css";

export default function Nav({ categories }) {
  const [activeSlug, setActiveSlug] = useState(null);

  const handleScroll = (slug) => {
    const section = document.getElementById(slug);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSlug(slug);
    }
  };

  // Update activeSlug while scrolling
  useEffect(() => {
    let ticking = false;

    const handleScrollEvent = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let currentSection = null;
          categories.forEach(({ slug }) => {
            const section = document.getElementById(slug);
            if (section) {
              const { top, height } = section.getBoundingClientRect();
              if (
                top <= window.innerHeight / 2 &&
                top + height >= window.innerHeight / 2
              ) {
                currentSection = slug;
              }
            }
          });
          if (currentSection) setActiveSlug(currentSection);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, [categories]);

  // Set first category active on load
  useEffect(() => {
    if (categories.length > 0 && !activeSlug) {
      setActiveSlug(categories[0].slug);
    }
  }, [categories, activeSlug]);

  return (
    <nav className="qr-nav">
      <div className="qr-nav-buttons">
        {categories.map(({ name, slug }) => (
          <button
            key={slug}
            onClick={() => handleScroll(slug)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleScroll(slug)
            }
            className={`qr-nav-button ${activeSlug === slug ? "active" : ""}`}
          >
            {name}
          </button>
        ))}
      </div>
    </nav>
  );
}
