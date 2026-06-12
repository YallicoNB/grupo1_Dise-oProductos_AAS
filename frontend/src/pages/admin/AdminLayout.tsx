import React, { useState } from "react";
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

const AdminLayout: React.FC = () => {
  const { usuarioAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <button
        className="admin-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Abrir menu"
      >
        <i className={`bi ${sidebarOpen ? "bi-x" : "bi-list"}`}></i>
      </button>
      {sidebarOpen && (
        <div className="admin-overlay" onClick={closeSidebar} />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar-logo">
          <i className="bi bi-gem" />
          Antonela Admin
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <span>{usuarioAdmin?.nombreUsuario || "admin"}</span>
          <button
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
