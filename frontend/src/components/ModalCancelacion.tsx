import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ModalCancelacionProps {
  idCita: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalCancelacion: React.FC<ModalCancelacionProps> = ({
  idCita,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reembolsoInfo, setReembolsoInfo] = useState<{
    porcentajeReembolso: number;
    montoReembolso: number;
    montoOriginal: number;
  } | null>(null);

  // Cargar cotización de reembolso al abrir
  useEffect(() => {
    const fetchReembolso = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.post('/cancellation/calculate-refund', {
          idCita,
        });
        setReembolsoInfo(response.data);
      } catch (err: any) {
        console.error('Error al calcular reembolso:', err);
        setError(err.response?.data?.error || 'Error al calcular el monto de reembolso.');
      } finally {
        setLoading(false);
      }
    };

    fetchReembolso();
  }, [idCita]);

  const handleConfirmCancel = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await api.post('/cancellation/cancel-appointment', {
        idCita,
      });
      
      const { montoReembolsado, porcentajeReembolso, idTransaccion } = response.data;

      // Mostrar alerta/toast detallando el reembolso según los requisitos
      alert(`¡Cita cancelada con éxito!\n\nReembolso Procesado (Simulado):\n- ID Transacción: ${idTransaccion}\n- Porcentaje: ${porcentajeReembolso}%\n- Monto Devolución: S/${montoReembolsado.toFixed(2)}`);

      onSuccess();
    } catch (err: any) {
      console.error('Error al cancelar cita:', err);
      setError(err.response?.data?.error || 'No se pudo cancelar la cita. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(26, 22, 18, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        border: '1px solid rgba(184, 150, 46, 0.25)',
        width: '90%',
        maxWidth: '460px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        position: 'relative',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--muted)'
          }}
        >
          &times;
        </button>

        <h3 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '26px',
          color: 'var(--dark)',
          marginBottom: '16px',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          ¿Cancelar esta cita?
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)' }}>
            Cotizando reembolso estimado...
          </div>
        ) : error ? (
          <div style={{ color: '#b03030', backgroundColor: 'rgba(200, 60, 60, 0.08)', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        ) : reembolsoInfo ? (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', textAlign: 'center', marginBottom: '24px', lineHeight: '1.6' }}>
              De acuerdo con nuestras políticas, a continuación se detalla el reembolso para tu cita:
            </p>

            <div style={{
              background: 'var(--cream)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(184, 150, 46, 0.1)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Monto Pagado:</span>
                <span style={{ fontWeight: 600, color: 'var(--dark)' }}>S/{reembolsoInfo.montoOriginal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(184, 150, 46, 0.1)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--muted)' }}>Porcentaje Reembolso:</span>
                <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{reembolsoInfo.porcentajeReembolso}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', paddingTop: '4px' }}>
                <span style={{ color: 'var(--dark)' }}>Total a Devolver:</span>
                <span style={{ color: 'var(--gold)' }}>S/{reembolsoInfo.montoReembolso.toFixed(2)}</span>
              </div>
            </div>

            {reembolsoInfo.porcentajeReembolso < 100 && (
              <p style={{ fontSize: '11px', color: '#c0392b', fontStyle: 'italic', marginBottom: '24px', textAlign: 'center', lineHeight: '1.5' }}>
                * Nota: Debido a la proximidad de la cita, se retiene un porcentaje de penalidad.
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(184, 150, 46, 0.3)',
                  backgroundColor: 'transparent',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#c0392b',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(192, 57, 43, 0.3)'
                }}
              >
                {submitting ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ModalCancelacion;
