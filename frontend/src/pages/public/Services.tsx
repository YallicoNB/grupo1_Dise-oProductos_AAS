import React, { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { Servicio } from "../../types/_index";

const SERVICES_IMG: Record<string, string> = {
  Planchado:
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
  Laminado:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  Pedicura:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
  "Uñas acrílicas":
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  Rubber:
    "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80",
  Esmaltado:
    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&q=80",
  Alisado:
    "https://images.unsplash.com/photo-1521590832167-1618-08b7e18b0a1c?w=800&q=80",
  "Pestañas 1x1":
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80",
};

const TAGS_MAP: Record<string, string[]> = {
  Planchado: ["90 Minutos", "Alisado"],
  Laminado: ["45 Minutos", "Cejas"],
  Pedicura: ["60 Minutos", "Cuidado de Pies"],
  "Uñas acrílicas": ["120 Minutos", "Arte en Uñas"],
  Rubber: ["60 Minutos", "Esmaltado"],
  Esmaltado: ["45 Minutos", "Color"],
  Alisado: ["180 Minutos", "Tratamiento"],
  "Pestañas 1x1": ["90 Minutos", "Extensiones"],
};

const Services: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    api
      .get<Servicio[]>("/services")
      .then((res) => setServicios(res.data))
      .catch((err) => {
        console.error("Error al cargar servicios:", err);
        setError("No se pudieron cargar los servicios.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    itemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });
    return () => observer.disconnect();
  }, [servicios]);

  if (loading)
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "80px 24px" }}
      >
        <p>Cargando servicios...</p>
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
      <section className="hero">
        <p className="hero-brand">Antonela Art</p>
        <h1>Catálogo de Servicios</h1>
        <div className="hero-divider"></div>
        <p>
          Descubre una colección selecta de excelencia estética. Nuestros
          servicios están diseñados para armonizar tu belleza natural con la
          precisión de técnicas de alta artesanía.
        </p>
      </section>

      <section className="services">
        {servicios.map((svc, i) => {
          const precioStr = svc.precioMaximo
            ? `S/. ${svc.precioMinimo.toFixed(2)} – S/. ${svc.precioMaximo.toFixed(2)}`
            : `S/. ${svc.precioMinimo.toFixed(2)}`;
          const tags = TAGS_MAP[svc.nombre] || ["Servicio"];
          const reverse = i % 2 !== 0;

          return (
            <div
              key={svc.id}
              className={`service-item${reverse ? " reverse" : ""}`}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
            >
              <div className="service-img-wrap">
                <img
                  src={SERVICES_IMG[svc.nombre] || SERVICES_IMG["Planchado"]}
                  alt={svc.nombre}
                />
              </div>
              <div className="service-info">
                <div className="service-price">{precioStr}</div>
                <h2 className="service-title">{svc.nombre}</h2>
                <p className="service-desc">
                  {svc.descripcion || "Servicio profesional de alta calidad."}
                </p>
                <div className="tags">
                  {tags.map((tag, j) => (
                    <span className="tag" key={j}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
};

export default Services;
