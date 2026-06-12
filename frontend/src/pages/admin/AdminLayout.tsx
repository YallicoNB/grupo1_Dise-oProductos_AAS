import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: "bi-speedometer2", end: true },
  { path: "/admin/calendar", label: "Calendario", icon: "bi-calendar-event" },
  { path: "/admin/services", label: "Servicios", icon: "bi-scissors" },
  { path: "/admin/inventory", label: "Inventario", icon: "bi-box-seam" },
  { path: "/admin/gallery", label: "Galería", icon: "bi-images" },
  { path: "/admin/orders", label: "Ordenes", icon: "bi-receipt" },
  { path: "/admin/clients", label: "Clientes", icon: "bi-people" },
  { path: "/admin/tasks", label: "Tareas", icon: "bi-check2-square" },
];

const sidebarStyle: React.CSSProperties = {
  width: 250,
  minHeight: "100vh",
  background: "var(--white)",
  borderRight: "1px solid rgba(184,150,46,0.15)",
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 100,
};

const logoStyle: React.CSSProperties = {
  padding: "28px 20px 24px",
  borderBottom: "1px solid rgba(184,150,46,0.12)",
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: 22,
  fontWeight: 500,
  color: "var(--dark)",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const linkBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "11px 14px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 400,
  color: "var(--text-light)",
  textDecoration: "none",
  transition: "all 0.2s",
  fontFamily: '"DM Sans", sans-serif',
};

const footerStyle: React.CSSProperties = {
  padding: "16px 20px",
  borderTop: "1px solid rgba(184,150,46,0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 13,
  color: "var(--muted)",
};

const AdminLayout: React.FC = () => {
  const { usuarioAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)" }}>
      <aside style={sidebarStyle}>
        <div style={logoStyle}>
          <i className="bi bi-gem" style={{ color: "var(--gold)", fontSize: 20 }} />
          Antonela Admin
        </div>
        <nav style={navStyle}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive
                  ? "linear-gradient(135deg, rgba(184,150,46,0.12), rgba(184,150,46,0.04))"
                  : "transparent",
                color: isActive ? "var(--gold-dark)" : "var(--text-light)",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: 16, width: 20 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={footerStyle}>
          <span>{usuarioAdmin?.nombreUsuario || "admin"}</span>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 18,
              padding: 4,
            }}
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </aside>
      <main style={{ marginLeft: 250, flex: 1, padding: "32px 40px", minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
