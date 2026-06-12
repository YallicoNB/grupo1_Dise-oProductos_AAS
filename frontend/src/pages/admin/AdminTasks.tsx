import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Tarea {
  id: number;
  descripcion: string;
  completada: boolean;
  creadoEn?: string;
}

const AdminTasks: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTareas = async () => {
    try {
      setLoading(true);
      const res = await api.get<Tarea[]>("/admin/tasks");
      setTareas(res.data);
    } catch (err) {
      console.error("Error al cargar tareas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  const handleAdd = async () => {
    if (!nuevaDescripcion.trim()) return;
    setSaving(true);
    try {
      await api.post("/admin/tasks", { descripcion: nuevaDescripcion.trim(), completada: false });
      setNuevaDescripcion("");
      fetchTareas();
    } catch (err) {
      console.error("Error al crear tarea", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/admin/tasks/${id}/toggle`);
      fetchTareas();
    } catch (err) {
      console.error("Error al cambiar estado de tarea", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      fetchTareas();
    } catch (err) {
      console.error("Error al eliminar tarea", err);
    }
  };

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500 }}>
          Gestión
        </span>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: "var(--dark)", marginTop: 4 }}>
          Tareas
        </h1>
      </div>

      {/* Add task */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <input
          type="text"
          className="form-input"
          value={nuevaDescripcion}
          onChange={(e) => setNuevaDescripcion(e.target.value)}
          placeholder="Nueva tarea..."
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          style={{ flex: 1 }}
        />
        <button onClick={handleAdd} disabled={saving || !nuevaDescripcion.trim()} className="btn-gold" style={{ fontSize: 13, padding: "12px 24px", whiteSpace: "nowrap" }}>
          {saving ? "Agregando..." : "Agregar Tarea"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Cargando tareas...</div>
      ) : tareas.length === 0 ? (
        <div style={{ background: "var(--white)", borderRadius: 16, padding: "48px 24px", textAlign: "center", color: "var(--muted)", border: "1px solid rgba(184,150,46,0.1)" }}>
          No hay tareas registradas.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 32 }}>
          {/* Pendientes */}
          <div>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 500, color: "var(--dark)", marginBottom: 12 }}>
              Pendientes ({pendientes.length})
            </h3>
            {pendientes.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic" }}>¡Todo al día!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pendientes.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--white)", borderRadius: 12, padding: "12px 18px", border: "1px solid rgba(184,150,46,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <button onClick={() => handleToggle(t.id)} style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--gold)", background: "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {t.completada && <i className="bi bi-check" style={{ color: "var(--gold)", fontSize: 14 }} />}
                    </button>
                    <span style={{ flex: 1, fontSize: 14, color: "var(--dark)" }}>{t.descripcion}</span>
                    <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14, padding: 4 }}>
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completadas */}
          {completadas.length > 0 && (
            <div>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 500, color: "var(--text-light)", marginBottom: 12 }}>
                Completadas ({completadas.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {completadas.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--white)", borderRadius: 12, padding: "12px 18px", border: "1px solid rgba(184,150,46,0.06)", opacity: 0.65 }}>
                    <button onClick={() => handleToggle(t.id)} style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--gold)", background: "var(--gold)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-check" style={{ color: "white", fontSize: 14 }} />
                    </button>
                    <span style={{ flex: 1, fontSize: 14, color: "var(--text-light)", textDecoration: "line-through" }}>{t.descripcion}</span>
                    <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14, padding: 4 }}>
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
