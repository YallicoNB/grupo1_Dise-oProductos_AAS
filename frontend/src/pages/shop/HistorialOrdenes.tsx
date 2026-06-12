import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { OrdenCompra } from "../../types/_index";

const fmt = (n: number) => `S/${n.toFixed(2).replace(".", ",")}`;

const formatFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const HistorialOrdenes: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // api.ts agrega el JWT automáticamente
    api
      .get<OrdenCompra[]>("/cart/client/orders")
      .then((res) => setOrdenes(res.data))
      .catch((err) => {
        console.error("Error al cargar historial:", err);
        setError("No se pudo cargar el historial de órdenes.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 24px" }}>
        <p>Cargando historial...</p>
      </div>
    );

  if (error)
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 24px", color: "#c0392b" }}>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="container" style={{ padding: "48px 24px" }}>
      <div className="page-title-label">Mi cuenta</div>
      <h1 className="page-title" style={{ marginBottom: 32 }}>
        Historial de Órdenes
      </h1>

      {ordenes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
          <p>Aún no tienes órdenes registradas.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "DM Sans, sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border, #e8e0d5)", textAlign: "left" }}>
                <th style={{ padding: "10px 16px", color: "var(--muted)" }}>N° Orden</th>
                <th style={{ padding: "10px 16px", color: "var(--muted)" }}>Fecha</th>
                <th style={{ padding: "10px 16px", color: "var(--muted)" }}>Productos</th>
                <th style={{ padding: "10px 16px", color: "var(--muted)" }}>Método de pago</th>
                <th style={{ padding: "10px 16px", color: "var(--muted)", textAlign: "right" }}>Total</th>
                <th style={{ padding: "10px 16px", color: "var(--muted)" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} style={{ borderBottom: "1px solid var(--border, #e8e0d5)" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>#{orden.id}</td>
                  <td style={{ padding: "14px 16px" }}>{formatFecha(orden.creadoEn)}</td>
                  <td style={{ padding: "14px 16px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={orden.productos}>
                    {orden.productos}
                  </td>
                  <td style={{ padding: "14px 16px", textTransform: "capitalize" }}>{orden.metodoPago}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 600 }}>{fmt(orden.montoTotal)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 10px", borderRadius: 12,
                      fontSize: 12, fontWeight: 600,
                      background: orden.estado === "COMPLETADO" ? "#e8f5e9" : orden.estado === "PENDIENTE" ? "#fff8e1" : "#fce4ec",
                      color: orden.estado === "COMPLETADO" ? "#2e7d32" : orden.estado === "PENDIENTE" ? "#f57f17" : "#c62828",
                    }}>
                      {orden.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistorialOrdenes;