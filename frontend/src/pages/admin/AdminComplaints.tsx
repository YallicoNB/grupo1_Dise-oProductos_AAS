import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Comentario {
  id: number;
  cliente: { id: number; nombreCompleto: string; correoElectronico: string };
  mensaje: string;
  estado: string;
  respuestaAdmin: string | null;
  respondidoEn: string | null;
  creadoEn: string;
}

const AdminComplaints: React.FC = () => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [respondiendo, setRespondiendo] = useState<number | null>(null);
  const [respuestaText, setRespuestaText] = useState("");

  const fetchComentarios = async (estado?: string) => {
    try {
      setLoading(true);
      const params = estado ? { estado } : {};
      const res = await api.get<Comentario[]>("/admin/comments", { params });
      setComentarios(res.data);
    } catch (err) {
      console.error("Error al cargar comentarios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, []);

  const marcarLeido = async (id: number) => {
    try {
      await api.put(`/admin/comments/${id}/read`);
      setComentarios((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: "leido" } : c))
      );
    } catch (err) {
      console.error("Error al marcar como leido", err);
    }
  };

  const responder = async (id: number) => {
    if (!respuestaText.trim()) return;
    try {
      const res = await api.put(`/admin/comments/${id}/respond`, {
        respuesta: respuestaText.trim(),
      });
      setComentarios((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, estado: "respondido", respuestaAdmin: respuestaText.trim(), respondidoEn: new Date().toISOString() }
            : c
        )
      );
      setRespondiendo(null);
      setRespuestaText("");
    } catch (err) {
      console.error("Error al responder", err);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "enviado":
        return { bg: "rgba(0,123,255,0.12)", color: "#0056b3", label: "Enviado" };
      case "leido":
        return { bg: "rgba(255,193,7,0.12)", color: "#b8860b", label: "Leido" };
      case "respondido":
        return { bg: "rgba(40,167,69,0.12)", color: "#1e7e34", label: "Respondido" };
      default:
        return { bg: "rgba(108,117,125,0.12)", color: "#5a6268", label: estado };
    }
  };

  const filtered = filtro
    ? comentarios.filter(
        (c) =>
          c.cliente.nombreCompleto.toLowerCase().includes(filtro.toLowerCase()) ||
          c.mensaje.toLowerCase().includes(filtro.toLowerCase())
      )
    : comentarios;

  const pendientes = comentarios.filter((c) => c.estado === "enviado").length;

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
            Atencion al Cliente
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
            Comentarios y Quejas
            {pendientes > 0 && (
              <span
                style={{
                  marginLeft: 12,
                  background: "#dc3545",
                  color: "#fff",
                  fontSize: 13,
                  padding: "2px 10px",
                  borderRadius: 12,
                  verticalAlign: "middle",
                }}
              >
                {pendientes} sin leer
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["", "enviado", "leido", "respondido"].map((est) => (
            <button
              key={est}
              onClick={() => fetchComentarios(est || undefined)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1.5px solid rgba(184,150,46,0.3)",
                background: filtro === est ? "var(--gold)" : "transparent",
                color: filtro === est ? "#fff" : "var(--dark)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {est || "Todos"}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        className="form-input"
        placeholder="Buscar por cliente o mensaje..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{ marginBottom: 20, maxWidth: 400 }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
          Cargando comentarios...
        </div>
      ) : filtered.length === 0 ? (
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
          No hay comentarios.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((c) => {
            const sb = getStatusBadge(c.estado);
            return (
              <div
                key={c.id}
                style={{
                  background: "var(--white)",
                  borderRadius: 16,
                  border: "1px solid rgba(184,150,46,0.12)",
                  padding: 24,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 15, color: "var(--dark)" }}>
                      {c.cliente.nombreCompleto}
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>
                      {c.cliente.correoElectronico}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 20,
                      background: sb.bg,
                      color: sb.color,
                    }}
                  >
                    {sb.label}
                  </span>
                </div>

                <div
                  style={{
                    background: "rgba(0,0,0,0.02)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 12,
                    fontSize: 14,
                    color: "var(--dark)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {c.mensaje}
                </div>

                {c.respuestaAdmin && (
                  <div
                    style={{
                      background: "rgba(184,150,46,0.06)",
                      borderRadius: 8,
                      padding: "12px 16px",
                      marginBottom: 12,
                      borderLeft: "3px solid var(--gold)",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--gold)", marginBottom: 4 }}>
                      Tu respuesta:
                    </div>
                    <div style={{ fontSize: 13, color: "var(--dark)", whiteSpace: "pre-wrap" }}>
                      {c.respuestaAdmin}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
                  {new Date(c.creadoEn).toLocaleDateString("es-PE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.estado === "enviado" && (
                    <button
                      onClick={() => marcarLeido(c.id)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        border: "none",
                        background: "rgba(255,193,7,0.12)",
                        color: "#b8860b",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      Marcar como Leido
                    </button>
                  )}
                  {c.estado !== "respondido" && (
                    <button
                      onClick={() => {
                        setRespondiendo(respondiendo === c.id ? null : c.id);
                        if (respondiendo !== c.id) setRespuestaText("");
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        border: "none",
                        background: "rgba(184,150,46,0.15)",
                        color: "var(--gold-dark)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      {respondiendo === c.id ? "Cancelar" : "Responder"}
                    </button>
                  )}
                </div>

                {respondiendo === c.id && (
                  <div style={{ marginTop: 12 }}>
                    <textarea
                      className="form-input"
                      placeholder="Escribe tu respuesta..."
                      value={respuestaText}
                      onChange={(e) => setRespuestaText(e.target.value)}
                      rows={3}
                      style={{ width: "100%", marginBottom: 8 }}
                    />
                    <button
                      onClick={() => responder(c.id)}
                      disabled={!respuestaText.trim()}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 20,
                        border: "none",
                        background: "var(--gold)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: respuestaText.trim() ? "pointer" : "not-allowed",
                        opacity: respuestaText.trim() ? 1 : 0.6,
                        fontFamily: '"DM Sans", sans-serif',
                      }}
                    >
                      Enviar Respuesta
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
