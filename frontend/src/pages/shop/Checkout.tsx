import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";

const fmt = (n: number) => `S/${n.toFixed(2).replace(".", ",")}`;
const iconoFallback = "bi-box-seed";

const iconos: Record<string, string> = {
  "Serum": "bi-droplet",
  "Mist": "bi-water",
  "Aceite": "bi-droplet-half",
  "Mascarilla": "bi-cup-straw",
  "Vitamina": "bi-brightness-alt-high",
  "Peine": "bi-scissors",
  "Crema": "bi-hand-index",
  "Gua": "bi-gem",
};

const getIcon = (nombre: string) => {
  for (const [key, icon] of Object.entries(iconos)) {
    if (nombre.startsWith(key)) return icon;
  }
  return iconoFallback;
};

const Checkout: React.FC = () => {
  const { items, total } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStripePayment = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/cart/create-checkout-session", {
        productos: items.map((i) => ({
          id: i.producto.id,
          nombre: i.producto.nombre,
          precio: i.producto.precio,
          cantidad: i.cantidad,
        })),
      });

      const { url, ordenId } = response.data;

      if (url) {
        localStorage.setItem("stripe_orden_id", String(ordenId));
        window.location.href = url;
      } else {
        setError("No se pudo obtener la URL de pago de Stripe.");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.mensaje ||
        "Error al conectar con Stripe. ¿Iniciaste sesión?";
      setError(typeof msg === "string" ? msg : "Error al procesar el pago.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "80px 24px" }}>
        <p>No tienes productos en el carrito.</p>
        <button className="checkout-btn" onClick={() => navigate("/products")} style={{ marginTop: 16 }}>
          Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: 900 }}>
      <div className="page-title-label">Caja</div>
      <h1 className="page-title" style={{ marginBottom: 32 }}>
        Finalizar Compra
      </h1>

      <div className="checkout-layout">
        <div className="order-summary-card">
          <div className="summary-title" style={{ marginBottom: 16 }}>
            Resumen de tu orden
          </div>
          {items.map(({ producto, cantidad }) => (
            <div className="order-item" key={producto.id}>
              <div className="order-img">
                <i className={`bi ${getIcon(producto.nombre)}`} style={{ fontSize: 24 }}></i>
              </div>
              <div className="order-item-info">
                <div className="order-item-name">{producto.nombre}</div>
                <div className="order-item-qty">Cantidad: {cantidad}</div>
              </div>
              <div className="order-item-price">
                {fmt(producto.precio * cantidad)}
              </div>
            </div>
          ))}

          <div className="order-totals" style={{ marginTop: 16 }}>
            <div className="order-total-row">
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="order-total-row">
              <span>Envío</span>
              <span style={{ color: "var(--gold)" }}>Gratis</span>
            </div>
            <div className="order-total-final">
              <div className="lbl">Total</div>
              <div className="amt">{fmt(total)}</div>
            </div>
          </div>
        </div>

        <div className="card-payment-box">
          <div className="card-pay-title">Pagar con Stripe</div>
          <div className="card-pay-sub">
            Tu pago es procesado de forma segura por Stripe
          </div>
          <div className="card-logos">
            <div className="card-logo">VISA</div>
            <div className="card-logo">MC</div>
            <div className="card-logo">AMEX</div>
          </div>

          {error && (
            <div style={{
              background: "#ffeaea", color: "#c0392b",
              padding: "12px 16px", borderRadius: 8,
              marginBottom: 16, fontSize: 14,
            }}>
              <i className="bi bi-exclamation-triangle" style={{ marginRight: 6 }}></i>
              {error}
            </div>
          )}

          <button
            type="button"
            className="pay-btn-final"
            onClick={handleStripePayment}
            disabled={loading}
          >
            {loading ? (
              <>Procesando...</>
            ) : (
              <>
                <i className="bi bi-credit-card"></i>
                Pagar {fmt(total)} con Stripe
              </>
            )}
          </button>

          <div className="terms-note" style={{ marginTop: 16 }}>
            Al pagar serás redirigido a Stripe para completar la transacción de forma segura.
          </div>

          <button
            type="button"
            className="back-link"
            onClick={() => navigate("/cart")}
            style={{ marginTop: 12 }}
          >
            ← Volver al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
