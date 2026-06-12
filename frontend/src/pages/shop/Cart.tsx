import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  urlImagen?: string;
  qty: number;
}

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
  const { items: cartItems } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState<Producto[]>([]);

  useEffect(() => {
    const deContexto = cartItems.map((item) => ({
      ...item.producto,
      qty: item.cantidad,
    }));

    if (deContexto.length > 0) {
      setItems(deContexto);
      return;
    }

    const cacheado = localStorage.getItem("carrito_salon") || localStorage.getItem("carrito") || localStorage.getItem("cart_items");
    if (cacheado) {
      try {
        const parsed = JSON.parse(cacheado);
        const itemsArr = Array.isArray(parsed)
          ? parsed.map((p: any) => ({
              id: p.id ?? p.producto?.id,
              nombre: p.nombre ?? p.producto?.nombre,
              descripcion: p.descripcion ?? p.producto?.descripcion,
              precio: p.precio ?? p.producto?.precio,
              urlImagen: p.urlImagen ?? p.producto?.urlImagen,
              qty: p.qty ?? p.cantidad ?? 1,
            }))
          : [];
        setItems(itemsArr);
      } catch {
        // ignorar
      }
    }
  }, [cartItems]);

  const getIcon = (nombre: string) => {
    for (const [key, icon] of Object.entries(iconos)) {
      if (nombre.startsWith(key)) return icon;
    }
    return iconoFallback;
  };

  const getTotal = () => items.reduce((s, p) => s + p.precio * p.qty, 0);
  const fmt = (n: number) => "S/" + n.toFixed(2).replace(".", ",");

  const changeQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newQty = p.qty + delta;
        return newQty < 1 ? p : { ...p, qty: newQty };
      }),
    );
  };

  const removeItem = (id: number) => {
    const nuevosItems = items.filter((p) => p.id !== id);
    setItems(nuevosItems);
    localStorage.setItem("carrito_salon", JSON.stringify(nuevosItems));
  };

  const total = getTotal();

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
            {items.map((p) => (
              <div className="product-item" key={p.id}>
                <div className="product-img">
                  <i className={`bi ${getIcon(p.nombre)}`} style={{ fontSize: 28 }}></i>
                </div>
                <div className="product-info">
                  <div className="product-name">{p.nombre}</div>
                  <div className="product-desc">{p.descripcion}</div>
                  <div className="qty-row">
                    <div className="qty-ctrl">
                      <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>−</button>
                      <div className="qty-val">{p.qty}</div>
                      <button className="qty-btn" onClick={() => changeQty(p.id, 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeItem(p.id)}>Eliminar</button>
                  </div>
                </div>
                <div className="product-price">{fmt(p.precio * p.qty)}</div>
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
