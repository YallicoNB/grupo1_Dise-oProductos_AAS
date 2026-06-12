import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

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
const iconoFallback = "bi-box-seed";

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  const getIcon = (nombre: string) => {
    for (const [key, icon] of Object.entries(iconos)) {
      if (nombre.startsWith(key)) return icon;
    }
    return iconoFallback;
  };

  const fmt = (n: number) => "S/" + n.toFixed(2).replace(".", ",");

  const changeQty = (id: number, delta: number) => {
    const item = items.find((i) => i.producto.id === id);
    if (item) {
      const newQty = item.cantidad + delta;
      if (newQty >= 1) {
        updateQuantity(id, newQty);
      }
    }
  };

  return (
    <div className="container">
      <div className="page-title-label">Experiencia de Compra</div>
      <h1 className="page-title">Tus Productos</h1>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--muted)" }}>
          <p>No tienes productos en el carrito.</p>
          <button className="checkout-btn" onClick={() => navigate("/products")} style={{ marginTop: 16, width: "auto", padding: "12px 32px" }}>
            Ver Productos
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="products-list">
            {items.map(({ producto, cantidad }) => (
              <div className="product-item" key={producto.id}>
                <div className="product-img">
                  <i className={`bi ${getIcon(producto.nombre)}`} style={{ fontSize: 28 }}></i>
                </div>
                <div className="product-info">
                  <div className="product-name">{producto.nombre}</div>
                  <div className="product-desc">{producto.descripcion}</div>
                  <div className="qty-row">
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => changeQty(producto.id, -1)}>−</button>
                      <div className="qty-val">{cantidad}</div>
                      <button className="qty-btn" onClick={() => changeQty(producto.id, 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(producto.id)}>Eliminar</button>
                  </div>
                </div>
                <div className="product-price">{fmt(producto.precio * cantidad)}</div>
              </div>
            ))}
          </div>

          <div className="sidebar">
            <div className="summary-card">
              <div className="summary-title">Resumen</div>
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span>{fmt(total)}</span>
              </div>
              <div className="summary-row">
                <span className="label">Envío</span>
                <span className="free">Gratis</span>
              </div>
              <hr className="summary-divider" />
              <div className="total-row">
                <div className="total-label">Total</div>
                <div className="total-amount">{fmt(total)}</div>
              </div>

              <button className="checkout-btn" onClick={() => navigate("/shop/checkout")}>
                Ir a Pagar →
              </button>
              <div className="secure-note">
                <i className="bi bi-lock"></i> Pago seguro procesado por Mercado Pago
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
