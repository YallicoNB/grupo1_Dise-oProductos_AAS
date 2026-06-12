import React from "react";
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

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/" ? "active" : "";
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-icon">
          <img src="/img/logo antonela art.png" alt="Antonela Art" />
        </div>
        Antonela Art
      </Link>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link to={item.path} className={isActive(item.path)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-icons">
        <Link to="/cart" className="cart-icon-wrapper">
          <i className="bi bi-bag"></i>
          {items.length > 0 && (
            <span className="cart-badge">{items.length}</span>
          )}
        </Link>
        <Link to="/login">
          <i className="bi bi-person"></i>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
