import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Cita {
  id: number;
  fechaCita: string;
  horaCita: string;
  estado: string;
  montoPagado: number | null;
  cliente: { id: number; nombreCompleto: string; telefono: string };
  servicio: { id: number; nombre: string; duracionMinutos?: number };
}

const AdminCalendar: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [timeTracking, setTimeTracking] = useState<Record<number, { activo: boolean; horaInicio?: string; horaFin?: string; diferenciaMinutos?: number; completadoATiempo?: boolean }>>({});
  const [startLoading, setStartLoading] = useState<number | null>(null);

  const loadTimeTracking = async (citas: Cita[]) => {
    const tracking: Record<number, any> = {};
    await Promise.all(
      citas.map(async (c) => {
        try {
          const res = await api.get(`/admin/appointments/${c.id}/time`);
          tracking[c.id] = res.data;
        } catch {
          tracking[c.id] = { activo: false };
        }
      })
    );
    setTimeTracking(tracking);
  };

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const res = await api.get<Cita[]>("/admin/appointments", {
        params: { desde: filtroFecha, hasta: filtroFecha },
      });
      setCitas(res.data);
      await loadTimeTracking(res.data);
    } catch (err) {
      console.error("Error al cargar citas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [filtroFecha]);

  const startService = async (id: number) => {
    setStartLoading(id);
    try {
      await api.post(`/admin/appointments/${id}/start`);
      await fetchCitas();
    } catch (err: any) {
      console.error("Error al iniciar servicio", err);
      alert(err.response?.data?.error || "Error al iniciar servicio");
    } finally {
      setStartLoading(null);
    }
  };

  const completeService = async (id: number) => {
    setStartLoading(id);
    try {
      await api.post(`/admin/appointments/${id}/complete`);
      await fetchCitas();
    } catch (err: any) {
      console.error("Error al finalizar servicio", err);
      alert(err.response?.data?.error || "Error al finalizar servicio");
    } finally {
      setStartLoading(null);
    }
  };

  const cambiarEstado = async (id: number, estado: string) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { estado });
      fetchCitas();
    } catch (err) {
      console.error("Error al cambiar estado", err);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return { bg: "rgba(255,193,7,0.12)", color: "#b8860b" };
      case "confirmada":
        return { bg: "rgba(0,123,255,0.12)", color: "#0056b3" };
      case "completada":
        return { bg: "rgba(40,167,69,0.12)", color: "#1e7e34" };
      case "cancelada":
        return { bg: "rgba(220,53,69,0.12)", color: "#bd2130" };
      default:
        return { bg: "rgba(108,117,125,0.12)", color: "#5a6268" };
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 500,
            }}
          >
            Gestión de Agenda
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
            Calendario de Citas
          </h1>
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginRight: 8,
            }}
          >
            Fecha:
          </label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="form-input"
            style={{ width: 180, display: "inline-block" }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
          Cargando citas...
        </div>
      ) : citas.length === 0 ? (
        <div
          style={{
            background: "var(--white)",
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--muted)",
            border: "1px solid rgba(184,150,46,0.1)",
          }}
        >
          No hay citas para esta fecha.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "var(--white)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid rgba(184,150,46,0.15)",
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Hora</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Cliente</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Servicio</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Teléfono</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => {
                const sc = getStatusColor(cita.estado);
                return (
                  <tr
                    key={cita.id}
                    style={{
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(184,150,46,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 18px",
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: 18,
                        fontWeight: 500,
                        color: "var(--dark)",
                      }}
                    >
                      {cita.horaCita.substring(0, 5)}
                    </td>
                    <td style={{ padding: "16px 18px", fontWeight: 500, color: "var(--dark)" }}>
                      {cita.cliente?.nombreCompleto || "—"}
                    </td>
                    <td style={{ padding: "16px 18px", color: "var(--text)" }}>
                      {cita.servicio?.nombre || "—"}
                    </td>
                    <td style={{ padding: "16px 18px", color: "var(--text-light)", fontSize: 13 }}>
                      {cita.cliente?.telefono || "—"}
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 12px",
                          borderRadius: 20,
                          background: sc.bg,
                          color: sc.color,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {/* Time tracking */}
                        {cita.estado === "confirmada" && !timeTracking[cita.id]?.horaInicio && (
                          <button
                            onClick={() => startService(cita.id)}
                            disabled={startLoading === cita.id}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              border: "none",
                              background: "rgba(0,123,255,0.12)",
                              color: "#0056b3",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            {startLoading === cita.id ? "..." : "▶ Iniciar"}
                          </button>
                        )}
                        {timeTracking[cita.id]?.horaInicio && !timeTracking[cita.id]?.horaFin && (
                          <button
                            onClick={() => completeService(cita.id)}
                            disabled={startLoading === cita.id}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              border: "none",
                              background: "rgba(220,53,69,0.12)",
                              color: "#bd2130",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            {startLoading === cita.id ? "..." : "⏹ Finalizar"}
                          </button>
                        )}
                        {timeTracking[cita.id]?.diferenciaMinutos !== undefined && (
                          <span style={{
                            fontSize: 11, padding: "6px 12px", borderRadius: 20,
                            background: timeTracking[cita.id]?.completadoATiempo ? "rgba(40,167,69,0.12)" : "rgba(255,193,7,0.12)",
                            color: timeTracking[cita.id]?.completadoATiempo ? "#1e7e34" : "#b8860b",
                            fontWeight: 600
                          }}>
                            {timeTracking[cita.id]?.diferenciaMinutos}min
                          </span>
                        )}

                        {/* Estado buttons */}
                        {cita.estado === "pendiente" && (
                          <button
                            onClick={() => cambiarEstado(cita.id, "confirmada")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              border: "none",
                              background: "rgba(0,123,255,0.12)",
                              color: "#0056b3",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            Confirmar
                          </button>
                        )}
                        {(cita.estado === "pendiente" || cita.estado === "confirmada") && !timeTracking[cita.id]?.horaInicio && (
                          <button
                            onClick={() => cambiarEstado(cita.id, "completada")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              border: "none",
                              background: "rgba(40,167,69,0.12)",
                              color: "#1e7e34",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            Completar
                          </button>
                        )}
                        {cita.estado !== "cancelada" && cita.estado !== "completada" && (
                          <button
                            onClick={() => cambiarEstado(cita.id, "cancelada")}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 20,
                              border: "none",
                              background: "rgba(220,53,69,0.1)",
                              color: "#bd2130",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCalendar;
