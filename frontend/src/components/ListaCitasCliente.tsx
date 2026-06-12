import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Cita } from '../types/appointments';
import { ModalCancelacion } from './ModalCancelacion';

export const ListaCitasCliente: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab activa: 'activas' | 'historial' | 'canceladas'
  const [activeTab, setActiveTab] = useState<'activas' | 'historial' | 'canceladas'>('activas');
  
  // Cita seleccionada para cancelar
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Cita[]>('/client/appointments');
      setCitas(response.data);
    } catch (err: any) {
      console.error('Error al cargar citas del cliente:', err);
      setError('No se pudo cargar el historial de citas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  // Filtrar citas según la pestaña activa
  const getFilteredCitas = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return citas.filter((cita) => {
      const state = cita.estado ? cita.estado.toLowerCase() : 'pendiente';
      
      if (activeTab === 'activas') {
        // Citas pendientes que no hayan pasado o simplemente estado 'pendiente'
        return state === 'pendiente';
      } else if (activeTab === 'historial') {
        // Citas completadas
        return state === 'completada';
      } else if (activeTab === 'canceladas') {
        // Citas canceladas
        return state === 'cancelada';
      }
      return false;
    });
  };

  const filteredCitas = getFilteredCitas();

  const getStatusBadgeStyle = (estado: string) => {
    const state = estado.toLowerCase();
    if (state === 'pendiente') {
      return { backgroundColor: 'rgba(184, 150, 46, 0.15)', color: 'var(--gold-dark)' };
    } else if (state === 'completada') {
      return { backgroundColor: 'rgba(46, 184, 92, 0.15)', color: '#1e7b34' };
    } else {
      return { backgroundColor: 'rgba(192, 57, 43, 0.15)', color: '#c0392b' };
    }
  };

  const getStatusText = (estado: string) => {
    const state = estado.toLowerCase();
    if (state === 'pendiente') return 'Pendiente';
    if (state === 'completada') return 'Completada';
    if (state === 'cancelada') return 'Cancelada';
    return estado;
  };

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(184, 150, 46, 0.2)',
        marginBottom: '28px',
        gap: '24px'
      }}>
        {[
          { id: 'activas', label: 'Próximas Citas' },
          { id: 'historial', label: 'Historial (Completadas)' },
          { id: 'canceladas', label: 'Canceladas' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '12px 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? 'var(--gold-dark)' : 'var(--muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'all 0.25s',
              fontFamily: '"DM Sans", sans-serif'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>Cargando citas...</div>
      ) : error ? (
        <div style={{ color: '#b03030', backgroundColor: 'rgba(200, 60, 60, 0.08)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>{error}</div>
      ) : filteredCitas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--muted)',
          background: 'var(--white)',
          borderRadius: '16px',
          border: '1px solid rgba(184, 150, 46, 0.1)'
        }}>
          No se encontraron citas en esta categoría.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredCitas.map((cita) => (
            <div
              key={cita.id}
              style={{
                background: 'var(--white)',
                borderRadius: '16px',
                border: '1px solid rgba(184, 150, 46, 0.15)',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(184,150,46,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: 'var(--dark)'
                  }}>
                    {cita.servicio?.nombre || 'Servicio'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    ...getStatusBadgeStyle(cita.estado)
                  }}>
                    {getStatusText(cita.estado)}
                  </span>
                </div>
                
                <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>
                    <i className="bi bi-calendar" style={{ marginRight: '6px', color: 'var(--gold)' }}></i>
                    {cita.fechaCita}
                  </span>
                  <span>
                    <i className="bi bi-clock" style={{ marginRight: '6px', color: 'var(--gold)' }}></i>
                    {cita.horaCita}
                  </span>
                  <span>
                    <i className="bi bi-cash-stack" style={{ marginRight: '6px', color: 'var(--gold)' }}></i>
                    Total: S/{(cita.montoPagado || cita.servicio?.precioMinimo || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Botón de Cancelar Cita */}
                {activeTab === 'activas' && (
                  <button
                    onClick={() => setSelectedCitaId(cita.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '30px',
                      border: '1.5px solid #c0392b',
                      backgroundColor: 'transparent',
                      color: '#c0392b',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.25s',
                      fontFamily: '"DM Sans", sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c0392b';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#c0392b';
                    }}
                  >
                    Cancelar Cita
                  </button>
                )}

                {/* Mostrar Monto Reembolsado si es cancelada y aplica */}
                {activeTab === 'canceladas' && (
                  <div style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>
                    {/* Nota: En un entorno real se obtendría el reembolso relacionado.
                        Simulamos un indicador de reembolso si la cita fue cancelada */}
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>Reembolsado</span>
                    <strong style={{ color: 'var(--gold-dark)', fontSize: '15px' }}>
                      {/* Mostramos el 100%, 50% o similar de manera estática o simulada en el historial */}
                      S/{(cita.montoPagado || cita.servicio?.precioMinimo || 0).toFixed(2)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cancelación */}
      {selectedCitaId !== null && (
        <ModalCancelacion
          idCita={selectedCitaId}
          onClose={() => setSelectedCitaId(null)}
          onSuccess={() => {
            setSelectedCitaId(null);
            fetchCitas(); // Refrescar lista de citas
          }}
        />
      )}
    </div>
  );
};

export default ListaCitasCliente;
