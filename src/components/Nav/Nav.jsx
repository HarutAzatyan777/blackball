// components/Nav.jsx
import React, { useState, useEffect, useRef } from "react";
import "./Nav.css";

export default function Nav({ categories }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || "");
  const navRef = useRef(null);

  // Scroll to section when button clicked
  const handleClick = (slug) => {
    const section = document.getElementById(slug);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSlug(slug);
      centerButton(slug);
    }
  };

  // Center active button in nav
  const centerButton = (slug) => {
    const nav = navRef.current;
    const btn = document.getElementById(`btn-${slug}`);
    if (nav && btn) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const offset =
        btnRect.left - navRect.left - navRect.width / 2 + btnRect.width / 2;
      nav.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Update active button based on scroll position
  useEffect(() => {
    const SCROLL_OFFSET = 150;

    const handleScroll = () => {
      let found = categories.find(({ slug }) => {
        const section = document.getElementById(slug);
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= SCROLL_OFFSET && rect.bottom >= SCROLL_OFFSET;
      });

      if (found && activeSlug !== found.slug) {
        setActiveSlug(found.slug);
        centerButton(found.slug);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories, activeSlug]);

  // ✅ Enable mouse drag scroll
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      nav.classList.add("dragging");
      startX = e.pageX - nav.offsetLeft;
      scrollLeft = nav.scrollLeft;
    };

    const mouseLeave = () => {
      isDown = false;
      nav.classList.remove("dragging");
    };

    const mouseUp = () => {
      isDown = false;
      nav.classList.remove("dragging");
    };

    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - nav.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll speed factor
      nav.scrollLeft = scrollLeft - walk;
    };

    nav.addEventListener("mousedown", mouseDown);
    nav.addEventListener("mouseleave", mouseLeave);
    nav.addEventListener("mouseup", mouseUp);
    nav.addEventListener("mousemove", mouseMove);

    return () => {
      nav.removeEventListener("mousedown", mouseDown);
      nav.removeEventListener("mouseleave", mouseLeave);
      nav.removeEventListener("mouseup", mouseUp);
      nav.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <nav className="qr-nav" ref={navRef}>
      <div className="qr-nav-buttons">
        {categories.map(({ name, slug }) => (
          <button
            key={slug}
            id={`btn-${slug}`}
            onClick={() => handleClick(slug)}
            className={`qr-nav-button ${activeSlug === slug ? "active" : ""}`}
          >
            {name}
          </button>
        ))}
      </div>
    </nav>
  );
}
