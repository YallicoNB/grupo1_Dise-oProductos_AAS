import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Cliente } from '../../types/users';
import { OrdenCompra } from '../../types/commerce';
import ListaCitasCliente from '../../components/ListaCitasCliente';

export const ClientPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, cliente: authCliente, logout } = useAuth();
  
  // Tab activa: 'citas' | 'perfil' | 'compras'
  const [activeSection, setActiveSection] = useState<'citas' | 'perfil' | 'compras'>('citas');
  
  // Estado local para perfil (permite edición)
  const [perfil, setPerfil] = useState<Cliente | null>(null);
  const [editando, setEditando] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [telefono, setTelefono] = useState('');
  const [perfilError, setPerfilError] = useState<string | null>(null);
  const [perfilSuccess, setPerfilSuccess] = useState<string | null>(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Estado para compras/órdenes
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [ordenesError, setOrdenesError] = useState<string | null>(null);

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cargar datos de perfil inicial y órdenes
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get<Cliente>('/client/profile');
        setPerfil(response.data);
        setNombreCompleto(response.data.nombreCompleto);
        setCorreoElectronico(response.data.correoElectronico);
        setTelefono(response.data.telefono);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        // Fallback a info del context si falla la API
        if (authCliente) {
          setPerfil(authCliente);
          setNombreCompleto(authCliente.nombreCompleto);
          setCorreoElectronico(authCliente.correoElectronico);
          setTelefono(authCliente.telefono);
        }
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, authCliente]);

  // Cargar órdenes cuando se entra a la sección de compras
  useEffect(() => {
    const fetchOrdenes = async () => {
      if (activeSection !== 'compras') return;
      try {
        setLoadingOrdenes(true);
        setOrdenesError(null);
        const response = await api.get<OrdenCompra[]>('/cart/client/orders');
        setOrdenes(response.data);
      } catch (err: any) {
        console.error('Error al cargar órdenes:', err);
        setOrdenesError('No se pudo cargar el historial de compras.');
      } finally {
        setLoadingOrdenes(false);
      }
    };

    if (isAuthenticated) {
      fetchOrdenes();
    }
  }, [isAuthenticated, activeSection]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilError(null);
    setPerfilSuccess(null);
    setGuardandoPerfil(true);

    try {
      const response = await api.put<Cliente>('/client/profile', {
        nombreCompleto,
        correoElectronico,
        telefono
      });
      setPerfil(response.data);
      setPerfilSuccess('Perfil actualizado con éxito.');
      setEditando(false);
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setPerfilError(err.response?.data?.error || 'Error al actualizar el perfil.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  // Formatear método de pago para vista amigable
  const formatMetodoPago = (metodo: string) => {
    if (metodo === 'efectivo') return 'Efectivo';
    if (metodo === 'simulado_credito') return 'Tarjeta de Crédito';
    return metodo;
  };

  // Formatear estado de orden
  const formatEstadoOrden = (estado: string) => {
    const lower = estado.toLowerCase();
    if (lower === 'completado' || lower === 'pagado') return 'Pagado';
    if (lower === 'pendiente') return 'Pendiente';
    return estado;
  };

  // Intentar parsear el JSON de productos, de lo contrario mostrar como texto crudo
  const renderProductosLista = (productosStr: string) => {
    try {
      const list = JSON.parse(productosStr);
      if (Array.isArray(list)) {
        return (
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-light)' }}>
            {list.map((item: any, idx: number) => (
              <li key={idx} style={{ marginBottom: '4px' }}>
                {item.producto?.nombre || item.nombre || 'Producto'} (x{item.cantidad})
              </li>
            ))}
          </ul>
        );
      }
    } catch (e) {
      // Si no es un JSON válido, mostrar como texto plano
    }
    return <span style={{ fontSize: '12px' }}>{productosStr}</span>;
  };

  return (
    <div className="page active" style={{ backgroundColor: 'var(--panel-bg, #fefbf3)', minHeight: '80vh' }}>
      <div className="container" style={{ padding: '60px 24px' }}>
        
        {/* Header del Panel */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          borderBottom: '1px solid rgba(184, 150, 46, 0.15)',
          paddingBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontWeight: 600,
              fontFamily: '"DM Sans", sans-serif'
            }}>
              Panel de Control Privado
            </span>
            <h1 style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '38px',
              fontWeight: 400,
              color: 'var(--dark)',
              marginTop: '4px'
            }}>
              Bienvenido, {perfil?.nombreCompleto || authCliente?.nombreCompleto || 'Cliente'}
            </h1>
          </div>
          
          <button
            onClick={handleLogoutClick}
            style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: '1.5px solid rgba(184, 150, 46, 0.4)',
              backgroundColor: 'transparent',
              color: 'var(--dark)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: '"DM Sans", sans-serif',
              transition: 'all 0.25s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.backgroundColor = 'rgba(184, 150, 46, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(184, 150, 46, 0.4)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Layout principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* Navegación Lateral */}
          <div style={{
            background: 'var(--white)',
            borderRadius: '16px',
            border: '1px solid rgba(184, 150, 46, 0.15)',
            padding: '24px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'citas', label: 'Mis Citas', icon: 'bi-calendar-check' },
                { id: 'perfil', label: 'Mi Perfil', icon: 'bi-person-circle' },
                { id: 'compras', label: 'Historial de Compras', icon: 'bi-bag-check' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeSection === item.id 
                      ? 'linear-gradient(135deg, rgba(184, 150, 46, 0.15), rgba(184, 150, 46, 0.05))' 
                      : 'transparent',
                    color: activeSection === item.id ? 'var(--gold-dark)' : 'var(--text-light)',
                    fontWeight: activeSection === item.id ? 600 : 400,
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    fontFamily: '"DM Sans", sans-serif'
                  }}
                >
                  <i className={`bi ${item.icon}`} style={{ fontSize: '16px', color: activeSection === item.id ? 'var(--gold)' : 'inherit' }}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de Sección */}
          <div style={{
            background: 'var(--white)',
            borderRadius: '20px',
            border: '1px solid rgba(184, 150, 46, 0.15)',
            padding: '40px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.01)'
          }}>
            
            {/* SECCIÓN 1: CITAS */}
            {activeSection === 'citas' && (
              <div>
                <h2 style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '28px',
                  fontWeight: 500,
                  color: 'var(--dark)',
                  marginBottom: '24px'
                }}>
                  Gestión de Citas
                </h2>
                <ListaCitasCliente />
              </div>
            )}

            {/* SECCIÓN 2: PERFIL */}
            {activeSection === 'perfil' && (
              <div>
                <h2 style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '28px',
                  fontWeight: 500,
                  color: 'var(--dark)',
                  marginBottom: '24px'
                }}>
                  Información de Perfil
                </h2>

                {perfilSuccess && (
                  <div style={{
                    background: 'rgba(46, 184, 92, 0.08)',
                    border: '1px solid rgba(46, 184, 92, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#1e7b34',
                    marginBottom: '2rem',
                    fontSize: '0.85rem'
                  }}>
                    {perfilSuccess}
                  </div>
                )}

                {perfilError && (
                  <div style={{
                    background: 'rgba(200, 60, 60, 0.08)',
                    border: '1px solid rgba(200, 60, 60, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#b03030',
                    marginBottom: '2rem',
                    fontSize: '0.85rem'
                  }}>
                    {perfilError}
                  </div>
                )}

                {!editando ? (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '14px' }}>Nombre Completo</span>
                      <span style={{ color: 'var(--dark)', fontSize: '15px' }}>{perfil?.nombreCompleto || '—'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '14px' }}>Correo Electrónico</span>
                      <span style={{ color: 'var(--dark)', fontSize: '15px' }}>{perfil?.correoElectronico || '—'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '14px' }}>Teléfono</span>
                      <span style={{ color: 'var(--dark)', fontSize: '15px' }}>{perfil?.telefono || '—'}</span>
                    </div>

                    <button
                      onClick={() => setEditando(true)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--gold)',
                        color: 'var(--white)',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: '"DM Sans", sans-serif',
                        width: 'fit-content',
                        marginTop: '12px',
                        boxShadow: '0 4px 12px rgba(184,150,46,0.2)'
                      }}
                    >
                      Editar Perfil
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Nombre Completo</label>
                      <input
                        type="text"
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Correo Electrónico</label>
                      <input
                        type="email"
                        value={correoElectronico}
                        onChange={(e) => setCorreoElectronico(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Teléfono</label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(false);
                          if (perfil) {
                            setNombreCompleto(perfil.nombreCompleto);
                            setCorreoElectronico(perfil.correoElectronico);
                            setTelefono(perfil.telefono);
                          }
                          setPerfilError(null);
                        }}
                        style={{
                          padding: '12px 24px',
                          border: '1.5px solid rgba(184, 150, 46, 0.4)',
                          borderRadius: '30px',
                          backgroundColor: 'transparent',
                          color: 'var(--dark)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          fontFamily: '"DM Sans", sans-serif'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardandoPerfil}
                        style={{
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '30px',
                          backgroundColor: 'var(--gold)',
                          color: 'var(--white)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          fontFamily: '"DM Sans", sans-serif',
                          boxShadow: '0 4px 12px rgba(184,150,46,0.2)'
                        }}
                      >
                        {guardandoPerfil ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* SECCIÓN 3: COMPRAS / HISTORIAL DE ÓRDENES */}
            {activeSection === 'compras' && (
              <div>
                <h2 style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: '28px',
                  fontWeight: 500,
                  color: 'var(--dark)',
                  marginBottom: '24px'
                }}>
                  Historial de Órdenes de Compra
                </h2>

                {loadingOrdenes ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>Cargando órdenes...</div>
                ) : ordenesError ? (
                  <div style={{ color: '#b03030', backgroundColor: 'rgba(200, 60, 60, 0.08)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>{ordenesError}</div>
                ) : ordenes.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: 'var(--muted)',
                    background: 'var(--white)',
                    borderRadius: '16px',
                    border: '1px solid rgba(184, 150, 46, 0.1)'
                  }}>
                    No has realizado ninguna compra de productos aún.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px',
                      textAlign: 'left'
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(184,150,46,0.2)', color: 'var(--muted)' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Orden ID</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Productos</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Método Pago</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Estado</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordenes.map((order) => (
                          <tr key={order.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <td style={{ padding: '16px', fontWeight: 500, color: 'var(--dark)' }}>
                              #{order.idTransaccionSimulada || order.id}
                            </td>
                            <td style={{ padding: '16px' }}>
                              {renderProductosLista(order.productos)}
                            </td>
                            <td style={{ padding: '16px', color: 'var(--text-light)' }}>
                              {formatMetodoPago(order.metodoPago)}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                backgroundColor: 'rgba(46, 184, 92, 0.12)',
                                color: '#1e7b34'
                              }}>
                                {formatEstadoOrden(order.estado)}
                              </span>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--gold-dark)' }}>
                              S/{order.montoTotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ClientPanel;
