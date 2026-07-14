import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface DashboardData {
  citasHoy: number;
  totalClientes: number;
  productosActivos: number;
  totalOrdenes: number;
  satisfaccionPromedio: number;
  totalEncuestas: number;
  serviciosATiempo: number;
  totalServiciosTimed: number;
  promedioDuracionMinutos: number;
}

interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  borderRadius: 16,
  padding: "24px 28px",
  border: "1px solid rgba(184,150,46,0.12)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
};

const statValue: React.CSSProperties = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: 36,
  fontWeight: 500,
  color: "var(--gold-dark)",
  lineHeight: 1,
};

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardData>("/admin/dashboard"),
      api.get<Notificacion[]>("/admin/dashboard/notifications"),
    ])
      .then(([d, n]) => {
        setData(d.data);
        setNotificaciones(n.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const marcarLeida = (id: number) => {
    api.post(`/admin/dashboard/notifications/${id}/read`).then(() => {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    });
  };

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const iconoTipo = (tipo: string) => {
    if (tipo.startsWith("pedido")) return "bi-receipt";
    if (tipo.startsWith("cita")) return "bi-calendar-event";
    return "bi-bell";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
        Cargando dashboard...
      </div>
    );
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const stats = [
    { label: "Citas Hoy", value: data?.citasHoy ?? 0, icon: "bi-calendar-check" },
    { label: "Clientes Registrados", value: data?.totalClientes ?? 0, icon: "bi-people" },
    { label: "Productos Activos", value: data?.productosActivos ?? 0, icon: "bi-box-seam" },
    { label: "Ordenes de Compra", value: data?.totalOrdenes ?? 0, icon: "bi-receipt" },
    { label: "Satisfaccion Promedio", value: data?.satisfaccionPromedio ?? 0, icon: "bi-star", suffix: "/5" },
    { label: "Encuestas Respondidas", value: data?.totalEncuestas ?? 0, icon: "bi-chat-square-text" },
    { label: "Servicios a Tiempo", value: data && data.totalServiciosTimed ? Math.round((data.serviciosATiempo / data.totalServiciosTimed) * 100) + "%" : "—", icon: "bi-clock" },
    { label: "Duracion Promedio", value: data?.promedioDuracionMinutos ? data.promedioDuracionMinutos + " min" : "—", icon: "bi-hourglass-split" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--gold)",
            fontWeight: 500,
          }}
        >
          Panel de Control
        </span>
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 36,
            fontWeight: 400,
            color: "var(--dark)",
            marginTop: 4,
          }}
        >
          Dashboard
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <i
                className={`bi ${s.icon}`}
                style={{ fontSize: 24, color: "var(--gold)", opacity: 0.7 }}
              />
            </div>
            <div style={statValue}>
              {(s as any).suffix ? `${s.value}${(s as any).suffix}` : s.value}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                marginTop: 4,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 20,
              fontWeight: 500,
              color: "var(--dark)",
              marginBottom: 16,
            }}
          >
            Accesos Rapidos
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { path: "/admin/calendar", label: "Ver Calendario de Citas" },
              { path: "/admin/services", label: "Gestionar Servicios" },
              { path: "/admin/inventory", label: "Revisar Inventario" },
              { path: "/admin/clients", label: "Lista de Clientes" },
            ].map((link) => (
              <a
                key={link.path}
                href={link.path}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "rgba(184,150,46,0.06)",
                  color: "var(--gold-dark)",
                  fontSize: 14,
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(184,150,46,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(184,150,46,0.06)";
                }}
              >
                → {link.label}
              </a>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h3
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 20,
              fontWeight: 500,
              color: "var(--dark)",
              marginBottom: 16,
            }}
          >
            Notificaciones
            {noLeidas > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  background: "var(--gold)",
                  color: "var(--white)",
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {noLeidas}
              </span>
            )}
          </h3>
          {notificaciones.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-light)" }}>
              No hay notificaciones.
            </p>
          ) : (
            <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {notificaciones.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: n.leida ? "transparent" : "rgba(184,150,46,0.06)",
                    border: "1px solid rgba(184,150,46,0.1)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  onClick={() => !n.leida && marcarLeida(n.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <i className={`bi ${iconoTipo(n.tipo)}`} style={{ color: "var(--gold)", fontSize: 14 }}></i>
                    <span style={{ fontWeight: n.leida ? 400 : 600, color: "var(--dark)" }}>
                      {n.mensaje}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginLeft: 22 }}>
                    {formatFecha(n.creadoEn)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
