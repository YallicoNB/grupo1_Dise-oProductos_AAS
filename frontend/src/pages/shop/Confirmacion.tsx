import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

const Confirmacion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get("status");
    const t = params.get("type");
    const sessionId = params.get("session_id");
    const citaId = params.get("citaId");

    if (s) setStatus(s);
    if (t) setType(t);

    if (s === "success" && !cleared) {
      setCleared(true);

      if (t === "cita" && sessionId && citaId && !pagoConfirmado) {
        setPagoConfirmado(true);
        api.post("/payment/confirmar-pago", { sessionId, idCita: Number(citaId) })
          .then(() => console.log("Pago de cita confirmado en BD"))
          .catch((err) => console.error("Error al confirmar pago:", err));
      }

      if (t !== "cita") {
        localStorage.removeItem("stripe_orden_id");
        localStorage.removeItem("cart_items");
        localStorage.removeItem("carrito_salon");
        localStorage.removeItem("carrito");
      }
    }
  }, [location.search, cleared, pagoConfirmado]);

  const getStatusIcon = () => {
    if (status === "success") return "bi-check-circle-fill";
    if (status === "failure" || status === "canceled") return "bi-x-circle-fill";
    if (status === "pending") return "bi-clock-fill";
    return "bi-cart-check";
  };

  const getStatusColor = () => {
    if (status === "success") return "#2a7a40";
    if (status === "failure" || status === "canceled") return "#c0392b";
    if (status === "pending") return "#d4a017";
    return "var(--gold)";
  };

  const getTitle = () => {
    if (status === "success") return "Pago Exitoso";
    if (status === "failure") return "Pago Rechazado";
    if (status === "canceled") return "Pago Cancelado";
    if (status === "pending") return "Pago Pendiente";
    return "Orden Confirmada";
  };

  const getMessage = () => {
    if (status === "success") {
      return type === "cita"
        ? "Tu cita ha sido pagada correctamente."
        : "Tu pago fue procesado correctamente.";
    }
    if (status === "failure") {
      return "El pago no pudo ser procesado. Intenta nuevamente.";
    }
    if (status === "canceled") {
      return "El pago fue cancelado. Puedes intentar de nuevo cuando quieras.";
    }
    if (status === "pending") {
      return "Tu pago esta siendo procesado.";
    }
    return null;
  };

  const statusMsg = getMessage();

  return (
    <div className="container" style={{ padding: "80px 24px" }}>
      <div className="success-wrap">
        <span className="success-icon">
          <i className={`bi ${getStatusIcon()}`} style={{ color: getStatusColor(), fontSize: 48 }}></i>
        </span>

        <div className="success-title">{getTitle()}</div>

        {statusMsg && <div className="success-msg">{statusMsg}</div>}

        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {type === "cita" ? (
            <>
              <button className="success-btn" onClick={() => navigate("/client/panel")}>
                Mis Citas
              </button>
              <button
                className="checkout-btn"
                style={{ background: "transparent", border: "1px solid var(--gold)", color: "var(--gold)" }}
                onClick={() => navigate("/")}
              >
                Ir al Inicio
              </button>
              {(status === "failure" || status === "canceled") && (
                <button className="success-btn" onClick={() => navigate("/booking")}>
                  Volver a Reserva
                </button>
              )}
            </>
          ) : (
            <>
              <button className="success-btn" onClick={() => navigate("/products")}>
                Volver al Catalogo
              </button>
              <button
                className="checkout-btn"
                style={{ background: "transparent", border: "1px solid var(--gold)", color: "var(--gold)" }}
                onClick={() => navigate("/")}
              >
                Ir al Inicio
              </button>
              {(status === "failure" || status === "canceled") && (
                <button className="success-btn" onClick={() => navigate("/cart")}>
                  Volver al Carrito
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
