import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <div className="brand-name">Antonela Art</div>
        <p>
          Elevando la belleza a una forma de arte. Productos curados para la
          piel más exigente.
        </p>
      </div>
      <div className="footer-col">
        <h4>Servicio</h4>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
      <div className="footer-col">
        <h4>Tienda</h4>
        <a href="#">Shipping &amp; Returns</a>
        <a href="#">Contact Us</a>
      </div>
      <div className="footer-col">
        <h4>Newsletter</h4>
        <div className="newsletter-wrap">
          <input
            type="email"
            placeholder="Tu email"
            className="newsletter-input"
          />
          <button className="newsletter-btn">→</button>
        </div>
        <p className="copyright">© 2026 Antonela Art. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
