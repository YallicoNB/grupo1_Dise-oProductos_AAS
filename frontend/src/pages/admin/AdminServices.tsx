import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioMinimo: number;
  precioMaximo: number | null;
}

const emptyForm = { nombre: "", descripcion: "", precioMinimo: "", precioMaximo: "" };

const AdminServices: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const res = await api.get<Servicio[]>("/admin/services");
      setServicios(res.data);
    } catch (err) {
      console.error("Error al cargar servicios", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: Servicio) => {
    setEditId(s.id);
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precioMinimo: String(s.precioMinimo),
      precioMaximo: s.precioMaximo ? String(s.precioMaximo) : "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precioMinimo) return;
    setSaving(true);
    try {
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precioMinimo: parseFloat(form.precioMinimo),
        precioMaximo: form.precioMaximo ? parseFloat(form.precioMaximo) : null,
      };

      if (editId) {
        await api.put(`/admin/services/${editId}`, body);
      } else {
        await api.post("/admin/services", body);
      }
      setShowModal(false);
      fetchServicios();
    } catch (err) {
      console.error("Error al guardar servicio", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchServicios();
    } catch (err) {
      console.error("Error al eliminar servicio", err);
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
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500 }}>
            Catálogo
          </span>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: "var(--dark)", marginTop: 4 }}>
            Servicios
          </h1>
        </div>
        <button className="btn-gold" onClick={openCreate} style={{ fontSize: 13, padding: "10px 24px" }}>
          + Nuevo Servicio
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Cargando servicios...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(184,150,46,0.15)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Descripción</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Precio Mín.</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Precio Máx.</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,150,46,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "14px 18px", fontWeight: 500, color: "var(--dark)" }}>{s.nombre}</td>
                  <td style={{ padding: "14px 18px", color: "var(--text-light)", fontSize: 13, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.descripcion || "—"}
                  </td>
                  <td style={{ padding: "14px 18px", fontFamily: '"Cormorant Garamond", serif', fontSize: 17, color: "var(--gold)" }}>
                    S/{Number(s.precioMinimo).toFixed(2)}
                  </td>
                  <td style={{ padding: "14px 18px", color: "var(--text-light)", fontSize: 14 }}>
                    {s.precioMaximo ? `S/${Number(s.precioMaximo).toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(s)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "rgba(184,150,46,0.12)", color: "var(--gold-dark)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: '"DM Sans", sans-serif' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(s.id)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "rgba(220,53,69,0.1)", color: "#bd2130", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: '"DM Sans", sans-serif' }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
             onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--white)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
               onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 500, color: "var(--dark)", marginBottom: 24 }}>
              {editId ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Nombre *</label>
                <input type="text" className="form-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Descripción</label>
                <textarea className="form-input" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: "vertical", fontFamily: '"DM Sans", sans-serif' }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Precio Mín. *</label>
                  <input type="number" step="0.01" className="form-input" value={form.precioMinimo} onChange={(e) => setForm({ ...form, precioMinimo: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Precio Máx.</label>
                  <input type="number" step="0.01" className="form-input" value={form.precioMaximo} onChange={(e) => setForm({ ...form, precioMaximo: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 24px", borderRadius: 30, border: "1.5px solid rgba(184,150,46,0.3)", background: "transparent", color: "var(--dark)", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: '"DM Sans", sans-serif' }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-gold" style={{ fontSize: 13, padding: "10px 24px" }}>
                {saving ? "Guardando..." : editId ? "Actualizar" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
