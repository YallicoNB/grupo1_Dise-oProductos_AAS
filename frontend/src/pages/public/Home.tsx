import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setSectionRef = (i: number) => (el: HTMLElement | null) => {
    sectionsRef.current[i] = el;
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-label">
            <i className="bi bi-star" style={{ marginRight: 6, fontSize: 10 }}></i>
            Experiencia de Belleza
          </div>
          <h1 className="hero-title">Belleza que<br />Inspira Confianza</h1>
          <div className="hero-elevator">
            <i className="bi bi-clock"></i>
            Reserva tu cita en 2 minutos
          </div>
          <p>
            Descubre nuestros servicios de alta gama para realzar tu belleza
            natural. Reserva tu cita hoy y dejate consentir.
          </p>
          <div className="hero-actions">
            <Link to="/booking"><button className="btn-gold btn-gold--hero">Reservar Cita</button></Link>
            <Link to="/services"><button className="btn-outline">Ver Servicios</button></Link>
          </div>
        </div>
        <div className="hero-img-wrap">
          <img src="/img/index/1.jpeg" alt="Salón Antonela Art" loading="eager" fetchPriority="high" />
          <div className="hero-img-badge">
            <span className="badge-num">+500</span>
            <span className="badge-txt">Clientes felices</span>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="servicios animate-on-scroll" ref={setSectionRef(0)}>
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Servicios profesionales de alta gama para realzar tu belleza</p>
        </div>
        <div className="grid">
          {[
            { img: '/img/index/2.jpeg', label: 'Planchado', icon: 'bi-scissors' },
            { img: '/img/index/3.jpeg', label: 'Laminado de cejas', icon: 'bi-eye' },
            { img: '/img/index/5.jpeg', label: 'Pedicura', icon: 'bi-flower1' },
            { img: '/img/index/6.jpeg', label: 'Ondulado', icon: 'bi-magic' },
            { img: '/img/index/7.jpeg', label: 'Rubber', icon: 'bi-palette' },
            { img: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&q=80', label: 'Trenzado de cabello', icon: 'bi-stars' },
            { img: '/img/index/8.jpeg', label: 'Corte para Damas', icon: 'bi-person' },
            { img: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&q=80', label: 'Lifting de pestañas', icon: 'bi-emoji-sunglasses' },
          ].map((item, i) => (
            <Link to="/services" className="card" key={i}>
              <div className="card-img-wrap">
                <img src={item.img} alt={item.label} loading="lazy" />
              </div>
              <p><i className={`bi ${item.icon}`} style={{ marginRight: 6, fontSize: 12 }}></i>{item.label}</p>
            </Link>
          ))}
        </div>
        <div className="servicios-footer">
          <Link to="/services"><button className="btn-outline-dark">Explorar todos los servicios</button></Link>
        </div>
      </section>

      {/* ── TRABAJOS ── */}
      <section className="trabajos animate-on-scroll" ref={setSectionRef(1)}>
        <div className="section-header">
          <h2>Nuestros Trabajos</h2>
          <p>Galeria de trabajos realizados con dedicacion y profesionalismo</p>
        </div>
        <div className="galeria">
          <img className="galeria-tall" src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80" alt="Trabajo 1" loading="lazy" />
          <img src="/img/index/10.jpeg" alt="Trabajo 2" loading="lazy" />
          <img className="galeria-wide" src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80" alt="Trabajo 3" loading="lazy" />
          <img src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80" alt="Trabajo 4" loading="lazy" />
          <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&q=80" alt="Trabajo 5" loading="lazy" />
          <img src="/img/index/9.jpeg" alt="Trabajo 6" loading="lazy" />
        </div>
      </section>

      {/* ── NUESTRA HISTORIA ── */}
      <section className="historia animate-on-scroll" ref={setSectionRef(2)}>
        <div className="section-header">
          <span className="hero-label">
            <i className="bi bi-heart" style={{ marginRight: 6 }}></i>
            Nuestra Historia
          </span>
          <h2>El Sueno de Maria, Hecho Realidad</h2>
        </div>
        <div className="historia-content">
          <div className="historia-text">
            <p>
              Todo comenzo en un pequeno rincon de su hogar, donde Maria transformaba
              su pasion por la belleza en arte. Con unas tijeras y una vision clara,
              empezo a atender a sus primeras clientas en la sala de su casa.
            </p>
            <p>
              Hoy, Antonela Art Salon es el reflejo de anos de dedicacion, aprendizaje
              constante y amor por el detalle. Cada servicio que ofrecemos lleva la
              misma esencia de aquel primer dia: hacer que cada persona se sienta
              unica, hermosa y segura de si misma.
            </p>
            <p>
              Detras de cada corte, cada diseno de unas y cada tratamiento, hay una
              historia de esfuerzo, de noches de practica y de suenos cumplidos.
              Maria y su equipo te invitan a ser parte de esta historia.
            </p>
            <div className="historia-firma">
              <i className="bi bi-quote"></i>
              <span>Maria Gutierrez — Fundadora</span>
            </div>
          </div>
          <div className="historia-img">
            <img src="/img/index/4.jpeg" alt="Nuestra historia" loading="lazy" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
