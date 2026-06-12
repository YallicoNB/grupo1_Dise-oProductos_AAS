import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Cliente {
  id: number;
  nombreCompleto: string;
  correoElectronico: string;
  telefono: string;
  creadoEn: string;
}

interface Cita {
  id: number;
  fechaCita: string;
  horaCita: string;
  estado: string;
  servicio: { id: number; nombre: string };
}

interface OrdenCompra {
  id: number;
  montoTotal: number;
  metodoPago: string;
  estado: string;
  creadoEn: string;
}

const AdminClients: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await api.get<Cliente[]>("/admin/clients");
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const verDetalle = async (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDetailLoading(true);
    try {
      const [citasRes, ordenesRes] = await Promise.all([
        api.get<Cita[]>(`/admin/clients/${cliente.id}/appointments`),
        api.get<OrdenCompra[]>(`/admin/clients/${cliente.id}/orders`),
      ]);
      setCitas(citasRes.data);
      setOrdenes(ordenesRes.data);
    } catch (err) {
      console.error("Error al cargar detalle del cliente", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = busqueda.trim()
    ? clientes.filter((c) =>
        c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.correoElectronico.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono.includes(busqueda)
      )
    : clientes;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500 }}>
          Base de Datos
        </span>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: "var(--dark)", marginTop: 4 }}>
          Clientes
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedCliente ? "1fr 1fr" : "1fr", gap: 24, alignItems: "start" }}>
        {/* Lista */}
        <div>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar cliente por nombre, correo o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Cargando clientes...</div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "var(--white)", borderRadius: 16, padding: "48px 24px", textAlign: "center", color: "var(--muted)", border: "1px solid rgba(184,150,46,0.1)" }}>
              No se encontraron clientes.
            </div>
          ) : (
            <div style={{ background: "var(--white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(184,150,46,0.15)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
                    <th style={{ padding: "14px 18px", textAlign: "left" }}>Nombre</th>
                    <th style={{ padding: "14px 18px", textAlign: "left" }}>Correo</th>
                    <th style={{ padding: "14px 18px", textAlign: "left" }}>Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}
                      onClick={() => verDetalle(c)}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer", transition: "background 0.2s",
                        background: selectedCliente?.id === c.id ? "rgba(184,150,46,0.06)" : "transparent" }}
                      onMouseEnter={(e) => { if (selectedCliente?.id !== c.id) e.currentTarget.style.background = "rgba(184,150,46,0.03)"; }}
                      onMouseLeave={(e) => { if (selectedCliente?.id !== c.id) e.currentTarget.style.background = "transparent"; }}>
                      <td style={{ padding: "14px 18px", fontWeight: 500, color: "var(--dark)" }}>{c.nombreCompleto}</td>
                      <td style={{ padding: "14px 18px", color: "var(--text-light)", fontSize: 13 }}>{c.correoElectronico}</td>
                      <td style={{ padding: "14px 18px", color: "var(--text)", fontSize: 13 }}>{c.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detalle */}
        {selectedCliente && (
          <div>
            <div style={{ background: "var(--white)", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(184,150,46,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 500, color: "var(--dark)" }}>
                  {selectedCliente.nombreCompleto}
                </h3>
                <button onClick={() => setSelectedCliente(null)} style={{ background: "none", border: "none", fontSize: 18, color: "var(--muted)", cursor: "pointer" }}>
                  <i className="bi bi-x-lg" />
                </button>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 20 }}>
                {selectedCliente.correoElectronico} · {selectedCliente.telefono}
              </div>

              {detailLoading ? (
                <div style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>Cargando...</div>
              ) : (
                <>
                  <h4 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    Citas ({citas.length})
                  </h4>
                  {citas.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 20 }}>Sin citas registradas.</p>
                  ) : (
                    <div style={{ marginBottom: 24 }}>
                      {citas.slice(0, 5).map((c) => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: 13 }}>
                          <span>{c.fechaCita} {c.horaCita.substring(0, 5)}</span>
                          <span style={{ color: "var(--text-light)" }}>{c.servicio?.nombre || "—"}</span>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontSize: 10,
                            fontWeight: 600,
                            background: c.estado === "completada" ? "rgba(40,167,69,0.12)" : c.estado === "cancelada" ? "rgba(220,53,69,0.1)" : "rgba(255,193,7,0.12)",
                            color: c.estado === "completada" ? "#1e7e34" : c.estado === "cancelada" ? "#bd2130" : "#b8860b",
                          }}>
                            {c.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <h4 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
                    Órdenes de Compra ({ordenes.length})
                  </h4>
                  {ordenes.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--text-light)" }}>Sin órdenes registradas.</p>
                  ) : (
                    <div>
                      {ordenes.slice(0, 5).map((o) => (
                        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: 13 }}>
                          <span>S/{Number(o.montoTotal).toFixed(2)}</span>
                          <span style={{ color: "var(--text-light)" }}>{o.metodoPago}</span>
                          <span style={{ color: "var(--muted)" }}>{o.estado}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClients;
