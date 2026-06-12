import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface OrdenCompra {
  id: number;
  cliente: { id: number; nombreCompleto: string; correoElectronico: string };
  productos: string;
  montoTotal: number;
  metodoPago: string;
  estado: string;
  idTransaccionSimulada: string;
  creadoEn: string;
}

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  borderRadius: 16,
  border: "1px solid rgba(184,150,46,0.12)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

const estadosDisponibles = ["pendiente", "completada", "cancelada"];

const badge = (estado: string): React.CSSProperties => {
  const colors: Record<string, string> = {
    pendiente: "#d4a017",
    completada: "#2a7a40",
    cancelada: "#c0392b",
  };
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    background: colors[estado] || "#888",
    textTransform: "capitalize",
  };
};

const AdminOrders: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get<OrdenCompra[]>("/admin/orders");
      setOrdenes(res.data);
    } catch (err) {
      console.error("Error al cargar ordenes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cambiarEstado = async (id: number, nuevo: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { estado: nuevo });
      load();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const parseProductos = (json: string): { nombre: string; cantidad: number }[] => {
    try {
      const items: any[] = JSON.parse(json);
      return items.map((i) => ({ nombre: i.nombre || i.producto || "Producto", cantidad: i.cantidad || 1 }));
    } catch {
      return [{ nombre: json.substring(0, 60), cantidad: 1 }];
    }
  };

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>Cargando ordenes...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500 }}>
          Administracion
        </span>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, fontWeight: 400, color: "var(--dark)", marginTop: 4 }}>
          Ordenes de Compra
        </h1>
      </div>

      {ordenes.length === 0 ? (
        <div style={{ ...cardStyle, padding: 40, textAlign: "center", color: "var(--muted)" }}>
          No hay ordenes registradas.
        </div>
      ) : (
        <div style={{ overflowX: "auto", ...cardStyle }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(184,150,46,0.12)", background: "rgba(184,150,46,0.04)" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Productos</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Metodo</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Accion</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const items = parseProductos(o.productos);
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <td style={tdStyle}>#{o.idTransaccionSimulada}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{o.cliente?.nombreCompleto || "—"}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{o.cliente?.correoElectronico || ""}</div>
                    </td>
                    <td style={tdStyle}>
                      {items.map((item, i) => (
                        <div key={i}>{item.nombre} <span style={{ color: "var(--muted)" }}>(x{item.cantidad})</span></div>
                      ))}
                    </td>
                    <td style={tdStyle}>S/{o.montoTotal.toFixed(2)}</td>
                    <td style={tdStyle}>{o.metodoPago}</td>
                    <td style={tdStyle}><span style={badge(o.estado)}>{o.estado}</span></td>
                    <td style={tdStyle}>{formatFecha(o.creadoEn)}</td>
                    <td style={tdStyle}>
                      <select
                        value={o.estado}
                        onChange={(e) => cambiarEstado(o.id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid rgba(184,150,46,0.25)",
                          fontSize: 12,
                          background: "var(--white)",
                          cursor: "pointer",
                        }}
                      >
                        {estadosDisponibles.map((est) => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </select>
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

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "middle",
};

export default AdminOrders;
