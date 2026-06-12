import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const navItems = [
  { path: "/", label: "Inicio" },
  { path: "/services", label: "Servicios" },
  { path: "/products", label: "Productos" },
  { path: "/cart", label: "Carrito" },
  { path: "/booking", label: "Reserva Cita" },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { items } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" ? "active" : "";
    return location.pathname.startsWith(path) ? "active" : "";
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMobile}>
        <div className="logo-icon">
          <img src="/img/logo antonela art.png" alt="Antonela Art" />
        </div>
        Antonela Art
      </Link>
      <button
        className={`hamburger ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`nav-links ${mobileOpen ? "nav-links--open" : ""}`}>
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={isActive(item.path)}
              onClick={closeMobile}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="nav-links-mobile-only">
          <Link to="/login" onClick={closeMobile}>
            <i className="bi bi-person"></i> Iniciar Sesion
          </Link>
        </li>
      </ul>
      {mobileOpen && (
        <div
          className="nav-overlay"
          onClick={closeMobile}
        />
      )}
      <div className="nav-icons">
        <Link to="/cart" className="cart-icon-wrapper" onClick={closeMobile}>
          <i className="bi bi-bag"></i>
          {items.length > 0 && (
            <span className="cart-badge">{items.length}</span>
          )}
        </Link>
        <Link to="/login" className="nav-icons-desktop">
          <i className="bi bi-person"></i>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
