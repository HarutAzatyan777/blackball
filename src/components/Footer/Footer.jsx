import React from "react";
import "./Footer.css"; // assuming you will add styles there

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-overlay">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact us</h3>
            <p>
              <a href="tel:+37433878877">+374-033-87-88-77</a>
            </p>
            <p>
              <a
                href="https://wa.me/37433878877"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp: +374-033-87-88-77
              </a>
            </p>
          </div>

          <div className="footer-section">
            <h3>Location</h3>
            <p>Եզնիկ Կողբացի 69</p>
            <p>15:00 - 04:00</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
