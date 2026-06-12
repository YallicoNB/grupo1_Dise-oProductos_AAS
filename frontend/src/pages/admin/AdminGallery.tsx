import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface ImagenGaleria {
  id: number;
  urlImagen: string;
  categoria: string | null;
  descripcion: string | null;
  servicio?: { id: number; nombre: string } | null;
}

const AdminGallery: React.FC = () => {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlImagen, setUrlImagen] = useState("");
  const [categoria, setCategoria] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchImagenes = async () => {
    try {
      setLoading(true);
      const res = await api.get<ImagenGaleria[]>("/admin/gallery");
      setImagenes(res.data);
    } catch (err) {
      console.error("Error al cargar galería", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagenes();
  }, []);

  const handleAdd = async () => {
    if (!urlImagen.trim()) return;
    setSaving(true);
    try {
      await api.post("/admin/gallery", {
        urlImagen: urlImagen.trim(),
        categoria: categoria.trim() || null,
      });
      setUrlImagen("");
      setCategoria("");
      fetchImagenes();
    } catch (err) {
      console.error("Error al agregar imagen", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta imagen?")) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      fetchImagenes();
    } catch (err) {
      console.error("Error al eliminar imagen", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500 }}>
          Galería Visual
        </span>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: "var(--dark)", marginTop: 4 }}>
          Galería de Imágenes
        </h1>
      </div>

      {/* Add form */}
      <div style={{ background: "var(--white)", borderRadius: 16, padding: "24px 28px", border: "1px solid rgba(184,150,46,0.12)", marginBottom: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontWeight: 500, color: "var(--dark)", marginBottom: 16 }}>
          Agregar Nueva Imagen
        </h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>URL de la Imagen *</label>
            <input type="text" className="form-input" value={urlImagen} onChange={(e) => setUrlImagen(e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>Categoría</label>
            <input type="text" className="form-input" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="uñas, cabello..." />
          </div>
          <button onClick={handleAdd} disabled={saving || !urlImagen.trim()} className="btn-gold" style={{ fontSize: 13, padding: "12px 24px", marginBottom: 0 }}>
            {saving ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Cargando galería...</div>
      ) : imagenes.length === 0 ? (
        <div style={{ background: "var(--white)", borderRadius: 16, padding: "48px 24px", textAlign: "center", color: "var(--muted)", border: "1px solid rgba(184,150,46,0.1)" }}>
          No hay imágenes en la galería.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {imagenes.map((img) => (
            <div key={img.id} style={{ background: "var(--white)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(184,150,46,0.12)", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "100%", height: 180, overflow: "hidden", background: "var(--cream-dark)" }}>
                {img.urlImagen ? (
                  <img src={img.urlImagen} alt={img.descripcion || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
                    <i className="bi bi-image" style={{ fontSize: 32 }} />
                  </div>
                )}
              </div>
              <div style={{ padding: "14px 16px" }}>
                {img.categoria && (
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>
                    {img.categoria}
                  </div>
                )}
                <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 10, wordBreak: "break-all" }}>
                  {img.urlImagen?.substring(0, 50)}...
                </div>
                <button onClick={() => handleDelete(img.id)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: "rgba(220,53,69,0.1)", color: "#bd2130", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: '"DM Sans", sans-serif' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
