import React, { useState } from 'react';
import api from '../services/api';

interface EncuestaModalProps {
  citaId: number;
  servicioNombre: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EncuestaModal: React.FC<EncuestaModalProps> = ({ citaId, servicioNombre, onClose, onSuccess }) => {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (puntuacion === 0) {
      setError('Selecciona una puntuacion');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await api.post('/client/survey', {
        idCita: citaId,
        puntuacion,
        comentario: comentario.trim() || null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar encuesta');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32, maxWidth: 440, width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{
          fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 500,
          color: 'var(--dark)', marginBottom: 8
        }}>
          Califica tu experiencia
        </h3>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
          {servicioNombre}
        </p>

        {error && (
          <div style={{
            background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.2)',
            borderRadius: 8, padding: '0.75rem', color: '#b03030', marginBottom: 16, fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Puntuacion
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPuntuacion(star)}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', border: '2px solid',
                    borderColor: star <= puntuacion ? 'var(--gold)' : 'rgba(184,150,46,0.2)',
                    background: star <= puntuacion ? 'var(--gold)' : 'transparent',
                    color: star <= puntuacion ? '#fff' : 'var(--muted)',
                    fontSize: 20, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (star > puntuacion) {
                      e.currentTarget.style.borderColor = 'var(--gold)';
                      e.currentTarget.style.background = 'rgba(184,150,46,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (star > puntuacion) {
                      e.currentTarget.style.borderColor = 'rgba(184,150,46,0.2)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600,
              color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em'
            }}>
              Comentario (opcional)
            </label>
            <textarea
              className="form-input"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuentanos como fue tu experiencia..."
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 30, border: '1.5px solid rgba(184,150,46,0.3)',
                background: 'transparent', color: 'var(--dark)', cursor: 'pointer', fontSize: 13,
                fontFamily: '"DM Sans", sans-serif'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || puntuacion === 0}
              style={{
                padding: '10px 24px', borderRadius: 30, border: 'none',
                background: 'var(--gold)', color: '#fff', cursor: enviando ? 'wait' : 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: '"DM Sans", sans-serif',
                opacity: puntuacion === 0 ? 0.6 : 1
              }}
            >
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EncuestaModal;
