import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-text">
          <div className="hero-label">Experiencia de Belleza</div>
          <h1>Belleza que<br />Inspira Confianza</h1>
          <p>
            Descubre nuestros servicios de alta gama para realzar tu belleza
            natural. Reserva tu cita hoy y dejate consentir.
          </p>
          <div className="hero-actions">
            <Link to="/booking"><button className="btn-gold">Reservar Cita</button></Link>
            <Link to="/services"><button className="btn-outline">Ver Servicios</button></Link>
          </div>
        </div>
        <div className="hero-img-wrap">
          <img src="/img/index/1.jpeg" alt="Salón Antonela Art" />
          <div className="hero-img-badge">
            <span className="badge-num">+500</span>
            <span className="badge-txt">Clientes felices</span>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="servicios">
        <div className="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Servicios profesionales de alta gama para realzar tu belleza</p>
        </div>
        <div className="grid">
          {[
            { img: '/img/index/2.jpeg', label: 'Planchado' },
            { img: '/img/index/3.jpeg', label: 'Laminado de cejas' },
            { img: '/img/index/5.jpeg', label: 'Pedicura' },
            { img: '/img/index/6.jpeg', label: 'Ondulado' },
            { img: '/img/index/7.jpeg', label: 'Rubber' },
            { img: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&q=80', label: 'Trenzado de cabello' },
            { img: '/img/index/8.jpeg', label: 'Corte para Damas' },
            { img: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&q=80', label: 'Lifting de pestañas' },
          ].map((item, i) => (
            <Link to="/services" className="card" key={i}>
              <div className="card-img-wrap">
                <img src={item.img} alt={item.label} />
              </div>
              <p>{item.label}</p>
            </Link>
          ))}
        </div>
        <div className="servicios-footer">
          <Link to="/services"><button className="btn-outline-dark">Explorar todos los servicios</button></Link>
        </div>
      </section>

      {/* ── TRABAJOS ── */}
      <section className="trabajos">
        <div className="section-header">
          <h2>Nuestros Trabajos</h2>
          <p>Galería de trabajos realizados con dedicación y profesionalismo</p>
        </div>
        <div className="galeria">
          <img className="galeria-tall" src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80" alt="Trabajo 1" />
          <img src="/img/index/10.jpeg" alt="Trabajo 2" />
          <img className="galeria-wide" src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80" alt="Trabajo 3" />
          <img src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80" alt="Trabajo 4" />
          <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&q=80" alt="Trabajo 5" />
          <img src="/img/index/9.jpeg" alt="Trabajo 6" />
        </div>
      </section>
    </>
  );
};

export default Home;
