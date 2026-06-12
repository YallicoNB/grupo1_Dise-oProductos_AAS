import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  urlImagen: string | null;
  disponible: boolean;
}

const emptyForm = { nombre: "", descripcion: "", precio: "", urlImagen: "" };

const AdminInventory: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const res = await api.get<Producto[]>("/admin/products");
      setProductos(res.data);
    } catch (err) {
      console.error("Error al cargar productos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Producto) => {
    setEditId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: String(p.precio),
      urlImagen: p.urlImagen || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precio) return;
    setSaving(true);
    try {
      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        precio: parseFloat(form.precio),
        urlImagen: form.urlImagen || null,
        disponible: true,
      };

      if (editId) {
        await api.put(`/admin/products/${editId}`, body);
      } else {
        await api.post("/admin/products", body);
      }
      setShowModal(false);
      fetchProductos();
    } catch (err) {
      console.error("Error al guardar producto", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProductos();
    } catch (err) {
      console.error("Error al eliminar producto", err);
    }
  };

  const toggleDisponible = async (id: number, disponible: boolean) => {
    try {
      await api.patch(`/admin/products/${id}/disponible`, { disponible: !disponible });
      fetchProductos();
    } catch (err) {
      console.error("Error al cambiar disponibilidad", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500 }}>
            Productos
          </span>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: "var(--dark)", marginTop: 4 }}>
            Inventario
          </h1>
        </div>
        <button className="btn-gold" onClick={openCreate} style={{ fontSize: 13, padding: "10px 24px" }}>
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Cargando productos...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(184,150,46,0.15)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Precio</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Disponible</th>
                <th style={{ padding: "14px 18px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,150,46,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "14px 18px", fontWeight: 500, color: "var(--dark)" }}>{p.nombre}</td>
                  <td style={{ padding: "14px 18px", fontFamily: '"Cormorant Garamond", serif', fontSize: 17, color: "var(--gold)" }}>
                    S/{Number(p.precio).toFixed(2)}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <button
                      onClick={() => toggleDisponible(p.id, p.disponible)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "none",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: '"DM Sans", sans-serif',
                        background: p.disponible ? "rgba(40,167,69,0.12)" : "rgba(220,53,69,0.1)",
                        color: p.disponible ? "#1e7e34" : "#bd2130",
                      }}
                    >
                      {p.disponible ? "Sí" : "No"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "rgba(184,150,46,0.12)", color: "var(--gold-dark)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: '"DM Sans", sans-serif' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "rgba(220,53,69,0.1)", color: "#bd2130", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: '"DM Sans", sans-serif' }}>
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

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
             onClick={() => setShowModal(false)}>
          <div style={{ background: "var(--white)", borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
               onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 500, color: "var(--dark)", marginBottom: 24 }}>
              {editId ? "Editar Producto" : "Nuevo Producto"}
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
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Precio *</label>
                <input type="number" step="0.01" className="form-input" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>URL Imagen</label>
                <input type="text" className="form-input" value={form.urlImagen} onChange={(e) => setForm({ ...form, urlImagen: e.target.value })} placeholder="https://..." />
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

export default AdminInventory;
