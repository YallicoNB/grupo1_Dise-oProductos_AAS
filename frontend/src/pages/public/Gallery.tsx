import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { ImagenGaleria } from "../../types/_index";

const Gallery: React.FC = () => {
  const [imagenes, setImagenes] = useState<ImagenGaleria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImg, setSelectedImg] = useState<ImagenGaleria | null>(null);

  useEffect(() => {
    api
      .get<ImagenGaleria[]>("/gallery")
      .then((res) => setImagenes(res.data))
      .catch((err) => {
        console.error("Error al cargar galería:", err);
        setError("No se pudieron cargar las imágenes.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Agrupar por categoría
  const categorias = new Map<string, ImagenGaleria[]>();
  imagenes.forEach((img) => {
    const cat = img.categoria || "General";
    if (!categorias.has(cat)) categorias.set(cat, []);
    categorias.get(cat)!.push(img);
  });

  if (loading)
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "80px 24px" }}
      >
        <p>Cargando galería...</p>
      </div>
    );
  if (error)
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "80px 24px", color: "#c0392b" }}
      >
        <p>{error}</p>
      </div>
    );

  return (
    <>
      <section
        className="hero"
        style={{ flexDirection: "column", textAlign: "center" }}
      >
        <p className="hero-brand">Antonela Art</p>
        <h1>Galería de Trabajos</h1>
        <div className="hero-divider"></div>
        <p>
          Explora nuestra galería de trabajos realizados con dedicación y
          profesionalismo. Cada imagen refleja nuestra pasión por el arte de la
          belleza.
        </p>
      </section>

      {imagenes.length === 0 ? (
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--muted)" }}>
            No hay imágenes disponibles en la galería.
          </p>
        </div>
      ) : (
        Array.from(categorias.entries()).map(([categoria, items]) => (
          <section
            className="trabajos"
            key={categoria}
            style={{ paddingTop: 0 }}
          >
            <div className="section-header">
              <h2>{categoria}</h2>
            </div>
            <div className="galeria">
              {items.map((img) => (
                <img
                  key={img.id}
                  src={img.urlImagen}
                  alt={img.descripcion || categoria}
                  onClick={() => setSelectedImg(img)}
                  loading="lazy"
                  style={{
                    cursor: "pointer",
                    height: "220px",
                    objectFit: "cover",
                  }}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* LIGHTBOX MODAL */}
      {selectedImg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: "24px",
          }}
          onClick={() => setSelectedImg(null)}
        >
          <div
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              position: "relative",
            }}
          >
            <img
              src={selectedImg.urlImagen}
              alt={selectedImg.descripcion || "Galería"}
              loading="lazy"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                borderRadius: "12px",
                display: "block",
              }}
            />
            {selectedImg.descripcion && (
              <p
                style={{
                  color: "#fff",
                  textAlign: "center",
                  marginTop: "12px",
                  fontSize: "14px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {selectedImg.descripcion}
              </p>
            )}
            <button
              onClick={() => setSelectedImg(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "-8px",
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "32px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
