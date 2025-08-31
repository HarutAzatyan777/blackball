import React from "react";
import "./Footer.css"; // assuming you will add styles there

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-overlay">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact us</h3>
            <p>+374-33-06-77-99</p>
            <p>hello@logoipsum.com</p>
          </div>
          <div className="footer-section">
            <h3>Location</h3>
            <p>+ Tumanyan 7 </p>
            <p>14:00 - 03:00</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
