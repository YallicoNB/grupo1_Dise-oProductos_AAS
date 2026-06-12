import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Servicio } from "../../types/catalog";
import PoliticaCancelacion from "../../components/PoliticaCancelacion";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];

interface BookingState {
  serviceId: number | null;
  serviceName: string | null;
  servicePrice: number;
  pro: string | null;
  date: { d: number; m: number; y: number } | null;
  time: string | null;
}

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, cliente } = useAuth();

  const [state, setState] = useState<BookingState>({
    serviceId: null,
    serviceName: null,
    servicePrice: 0,
    pro: null,
    date: null,
    time: null,
  });

  const [services, setServices] = useState<Servicio[]>([]);
  const [slots, setSlots] = useState<{ hora: string; disponible: boolean }[]>(
    [],
  );
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagoLoading, setPagoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCita, setSuccessCita] = useState<any>(null);
  const [politicaAceptada, setPoliticaAceptada] = useState(false);

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState<"booking" | "success">("booking");

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Cargar servicios reales
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        const response = await api.get<Servicio[]>("/services");
        setServices(response.data);
      } catch (err) {
        console.error("Error al cargar servicios:", err);
        setErrorMsg("Error al cargar el catálogo de servicios.");
      } finally {
        setLoadingServices(false);
      }
    };
    if (isAuthenticated) {
      loadServices();
    }
  }, [isAuthenticated]);

  // Cargar slots disponibles cuando cambia la fecha o el servicio
  useEffect(() => {
    const loadSlots = async () => {
      if (!state.date || !state.serviceId) {
        setSlots([]);
        return;
      }
      try {
        setLoadingSlots(true);
        const pad = (n: number) => n.toString().padStart(2, "0");
        const fechaStr = `${state.date.y}-${pad(state.date.m + 1)}-${pad(state.date.d)}`;
        const response = await api.get("/appointments/available-slots", {
          params: {
            fecha: fechaStr,
            idServicio: state.serviceId,
          },
        });
        setSlots(response.data);
      } catch (err) {
        console.error("Error al cargar franjas horarias:", err);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [state.date, state.serviceId]);

  const allDone =
    state.serviceId &&
    state.pro &&
    state.date &&
    state.time &&
    politicaAceptada;

  const selectService = (svc: Servicio) => {
    setState({
      ...state,
      serviceId: svc.id,
      serviceName: svc.nombre,
      servicePrice: svc.precioMinimo,
      time: null, // resetear hora al cambiar servicio
    });
  };

  const selectPro = (name: string) => {
    setState({ ...state, pro: name });
  };

  const selectTime = (time: string) => {
    setState({ ...state, time });
  };

  const selectDay = (day: number) => {
    setState({
      ...state,
      date: { d: day, m: calMonth, y: calYear },
      time: null, // resetear hora al cambiar fecha
    });
  };

  const renderCalendar = () => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();
    const cells: React.ReactNode[] = [];

    DAYS.forEach((d) =>
      cells.push(
        <div className="cal-day-header" key={`h-${d}`}>
          {d}
        </div>,
      ),
    );

    for (let i = 0; i < offset; i++) {
      const prevDays = new Date(calYear, calMonth, 0).getDate();
      cells.push(
        <div className="cal-day empty disabled" key={`e-${i}`}>
          {prevDays - offset + i + 1}
        </div>,
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(calYear, calMonth, d);
      const isPast =
        thisDate <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday =
        d === today.getDate() &&
        calMonth === today.getMonth() &&
        calYear === today.getFullYear();
      const isSelected =
        state.date?.d === d &&
        state.date?.m === calMonth &&
        state.date?.y === calYear;

      cells.push(
        <div
          key={d}
          className={`cal-day${isPast ? " disabled" : ""}${isToday ? " today" : ""}${isSelected ? " selected" : ""}`}
          onClick={() => !isPast && selectDay(d)}
        >
          {d}
        </div>,
      );
    }
    return cells;
  };

  const handleConfirmBooking = async () => {
    if (!allDone || !state.date || !state.serviceId || !state.time) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const fechaStr = `${state.date.y}-${pad(state.date.m + 1)}-${pad(state.date.d)}`;

      const response = await api.post("/appointments", {
        idServicio: state.serviceId,
        fecha: fechaStr,
        hora: state.time,
        montoPagado: state.servicePrice,
      });

      setSuccessCita(response.data);
      setPage("success");
    } catch (err: any) {
      console.error("Error al crear cita:", err);
      setErrorMsg(
        err.response?.data?.error ||
          "No se pudo programar la cita. Verifica la disponibilidad.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayWithStripe = async () => {
    if (!successCita?.id) return;
    setPagoLoading(true);
    try {
      const res = await api.post("/payment/create-checkout-session", {
        idCita: successCita.id,
      });
      const { url } = res.data;
      window.location.href = url;
    } catch (err: any) {
      console.error("Error al crear sesion de pago:", err);
      setErrorMsg(
        err.response?.data?.error ||
          "No se pudo conectar con Stripe. Intenta nuevamente.",
      );
    } finally {
      setPagoLoading(false);
    }
  };

  const resetFlow = () => {
    setState({
      serviceId: null,
      serviceName: null,
      servicePrice: 0,
      pro: null,
      date: null,
      time: null,
    });
    setPage("booking");
    setErrorMsg(null);
    setSuccessCita(null);
    setPoliticaAceptada(false);
  };

  return (
    <>
      {/* PAGE: BOOKING */}
      {page === "booking" && (
        <div className="page active">
          <div className="container">
            <div className="booking-header">
              <h1>Reserva tu Cita</h1>
              <p>Reserva tu experiencia personalizada en unos pocos pasos.</p>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: "rgba(200, 60, 60, 0.08)",
                  border: "1px solid rgba(200, 60, 60, 0.2)",
                  borderRadius: "8px",
                  padding: "1rem",
                  color: "#b03030",
                  marginBottom: "2rem",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="booking-layout">
              <div className="booking-steps">
                {/* DATOS DE CLIENTE (AUTO-COMPLETADOS Y READONLY) */}
                <div className="step-block">
                  <div className="step-label">Datos del Cliente</div>
                  <div
                    style={{
                      display: "grid",
                      gap: "1rem",
                      gridTemplateColumns: "1fr 1fr",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontSize: "0.8rem",
                          color: "var(--muted)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={cliente?.nombreCompleto || ""}
                        className="form-input"
                        style={{ cursor: "not-allowed", opacity: 0.8 }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontSize: "0.8rem",
                          color: "var(--muted)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={cliente?.telefono || ""}
                        className="form-input"
                        style={{ cursor: "not-allowed", opacity: 0.8 }}
                      />
                    </div>
                  </div>
                </div>

                {/* STEP 1: SERVICE */}
                <div className="step-block">
                  <div className="step-label">1. Selecciona un Servicio</div>
                  <div className="service-list">
                    {loadingServices ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "var(--muted)",
                          padding: "1rem",
                        }}
                      >
                        Cargando catálogo de servicios...
                      </div>
                    ) : services.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "var(--muted)",
                          padding: "1rem",
                        }}
                      >
                        No hay servicios disponibles.
                      </div>
                    ) : (
                      services.map((svc) => (
                        <div
                          key={svc.id}
                          className={`service-item${state.serviceId === svc.id ? " selected" : ""}`}
                          onClick={() => selectService(svc)}
                        >
                          <div>
                            <div className="svc-name">{svc.nombre}</div>
                            <div className="svc-meta">
                              {svc.descripcion && `${svc.descripcion} · `}
                              {svc.precioMaximo
                                ? `S/${svc.precioMinimo.toFixed(2)} - S/${svc.precioMaximo.toFixed(2)}`
                                : `S/${svc.precioMinimo.toFixed(2)}`}
                            </div>
                          </div>
                          <div className="check">✓</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* STEP 2: PROFESSIONAL */}
                <div className="step-block">
                  <div className="step-label">2. Elige a tu Profesional</div>
                  <div className="pro-grid">
                    {[
                      {
                        name: "Adriana Velasco",
                        role: "Masterstylist",
                        avatar: "👩‍🎨",
                      },
                      {
                        name: "Julian Rossi",
                        role: "Colorexpert",
                        avatar: "👨‍🎨",
                      },
                    ].map((pro, i) => (
                      <div
                        key={i}
                        className={`pro-item${state.pro === pro.name ? " selected" : ""}`}
                        onClick={() => selectPro(pro.name)}
                      >
                        <div className="pro-avatar">{pro.avatar}</div>
                        <div className="pro-info">
                          <div className="pro-name">{pro.name}</div>
                          <div className="pro-role">{pro.role}</div>
                        </div>
                        <div className="pro-check">✓</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 3: DATE & TIME */}
                <div className="step-block">
                  <div className="step-label">3. Fecha y Hora</div>
                  <div className="calendar-wrap">
                    <div className="cal-header">
                      <button
                        className="cal-nav-btn"
                        onClick={() => {
                          if (calMonth === 0) {
                            setCalMonth(11);
                            setCalYear(calYear - 1);
                          } else setCalMonth(calMonth - 1);
                        }}
                      >
                        ‹
                      </button>
                      <div className="cal-title">
                        {MONTHS[calMonth]} {calYear}
                      </div>
                      <button
                        className="cal-nav-btn"
                        onClick={() => {
                          if (calMonth === 11) {
                            setCalMonth(0);
                            setCalYear(calYear + 1);
                          } else setCalMonth(calMonth + 1);
                        }}
                      >
                        ›
                      </button>
                    </div>
                    <div className="cal-grid">{renderCalendar()}</div>
                  </div>

                  <div className="time-grid">
                    {loadingSlots ? (
                      <div
                        style={{
                          gridColumn: "span 3",
                          textAlign: "center",
                          color: "var(--muted)",
                          padding: "1rem",
                        }}
                      >
                        Cargando horarios disponibles...
                      </div>
                    ) : !state.date || !state.serviceId ? (
                      <div
                        style={{
                          gridColumn: "span 3",
                          textAlign: "center",
                          color: "var(--muted)",
                          padding: "1rem",
                        }}
                      >
                        Selecciona un servicio y una fecha para ver horarios.
                      </div>
                    ) : slots.length === 0 ? (
                      <div
                        style={{
                          gridColumn: "span 3",
                          textAlign: "center",
                          color: "var(--muted)",
                          padding: "1rem",
                        }}
                      >
                        No hay horarios disponibles para esta fecha.
                      </div>
                    ) : (
                      slots.map((s) => (
                        <div
                          key={s.hora}
                          className={`time-slot${state.time === s.hora ? " selected" : ""}${!s.disponible ? " disabled" : ""}`}
                          onClick={() => s.disponible && selectTime(s.hora)}
                          style={
                            !s.disponible
                              ? {
                                  opacity: 0.5,
                                  cursor: "not-allowed",
                                  textDecoration: "line-through",
                                }
                              : {}
                          }
                        >
                          {s.hora}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* STEP 4: POLITICA CANCELACION */}
                <div className="step-block">
                  <div className="step-label">4. Políticas de Cancelación</div>
                  <PoliticaCancelacion
                    aceptado={politicaAceptada}
                    onAceptarChange={setPoliticaAceptada}
                    mostrarCheckbox={true}
                  />
                </div>
              </div>

              {/* SUMMARY SIDEBAR */}
              <div className="summary-sidebar">
                <div className="summary-card">
                  <div className="summary-top-label">Resumen</div>

                  <div className="summary-field">
                    <div className="summary-field-label">Servicio</div>
                    <div
                      className={`summary-field-val${!state.serviceName ? " placeholder" : ""}`}
                    >
                      {state.serviceName || "—"}
                    </div>
                  </div>

                  <div className="summary-field">
                    <div className="summary-field-label">Profesional</div>
                    <div
                      className={`summary-field-val${!state.pro ? " placeholder" : ""}`}
                    >
                      {state.pro || "—"}
                    </div>
                  </div>

                  <div className="summary-field">
                    <div className="summary-field-label">Fecha</div>
                    <div
                      className={`summary-field-val${!state.date ? " placeholder" : ""}`}
                    >
                      {state.date
                        ? `${state.date.d} ${MONTHS[state.date.m]}, ${state.date.y}${state.time ? ` – ${state.time}` : ""}`
                        : "—"}
                    </div>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-total-row">
                    <div className="summary-total-lbl">Total</div>
                    <div className="summary-total-amt">
                      {state.servicePrice > 0
                        ? `S/${state.servicePrice.toFixed(2)}`
                        : "S/0.00"}
                    </div>
                  </div>

                  <button
                    className="confirm-btn"
                    disabled={!allDone || isSubmitting}
                    onClick={handleConfirmBooking}
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar Reserva"}
                  </button>

                  <div className="cancel-note">
                    Al confirmar, aceptas nuestras políticas de cancelación.
                    Cancelación gratuita hasta 24h antes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: SUCCESS */}
      {page === "success" && (
        <div className="page active">
          <div className="container">
            <div className="success-wrap">
              <div className="success-badge">✨</div>
              <div className="success-title">¡Cita Confirmada!</div>
              <div className="success-sub">
                Tu reserva ha sido registrada exitosamente. Recibirás un
                recordatorio por WhatsApp 24 horas antes de tu cita.
              </div>

              <div className="booking-summary-box">
                <div className="bs-row">
                  <span className="key">ID de Cita</span>
                  <span className="val">#{successCita?.id || "—"}</span>
                </div>
                <div className="bs-row">
                  <span className="key">Servicio</span>
                  <span className="val">{state.serviceName || "—"}</span>
                </div>
                <div className="bs-row">
                  <span className="key">Profesional</span>
                  <span className="val">{state.pro || "—"}</span>
                </div>
                <div className="bs-row">
                  <span className="key">Fecha y Hora</span>
                  <span className="val">
                    {state.date
                      ? `${state.date.d} ${MONTHS[state.date.m]}, ${state.date.y} · ${state.time || ""}`
                      : "—"}
                  </span>
                </div>
                <div className="bs-row">
                  <span className="key">Total</span>
                  <span className="val" style={{ color: "var(--gold)" }}>
                    {state.servicePrice > 0
                      ? `S/${state.servicePrice.toFixed(2)}`
                      : "—"}
                  </span>
                </div>
              </div>

              {pagoLoading && (
                <div style={{ margin: "16px 0", fontSize: 14, color: "var(--muted)" }}>
                  Redirigiendo a Stripe...
                </div>
              )}

              {!pagoLoading && (
                <button
                  className="success-btn"
                  style={{
                    background: "#5469d4",
                    border: "none",
                    color: "#fff",
                  }}
                  onClick={handlePayWithStripe}
                >
                  Pagar con Stripe — S/{state.servicePrice.toFixed(2)}
                </button>
              )}

              <button className="success-btn" onClick={resetFlow}>
                Nueva Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Booking;
