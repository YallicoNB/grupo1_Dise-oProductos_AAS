import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

const fmt = (n: number) => `S/${n.toFixed(2).replace(".", ",")}`;

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose }) => {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/shop/checkout");
  };

  return (
    <>
      {open && (
        <div
          className="cart-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`cart-sidebar${open ? " cart-sidebar--open" : ""}`}>
        <div className="cart-sidebar__header">
          <h2 className="cart-sidebar__title">Tu Carrito</h2>
          <button
            className="cart-sidebar__close"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="cart-sidebar__body">
          {items.length === 0 ? (
            <div className="cart-sidebar__empty">
              <i className="bi bi-bag" style={{ fontSize: 40, opacity: 0.3 }} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="cart-sidebar__list">
              {items.map(({ producto, cantidad }) => (
                <li key={producto.id} className="cart-sidebar__item">
                  <img
                    src={producto.urlImagen || "/img/img1.webp"}
                    alt={producto.nombre}
                    className="cart-sidebar__img"
                    loading="lazy"
                  />
                  <div className="cart-sidebar__info">
                    <span className="cart-sidebar__name">{producto.nombre}</span>
                    <span className="cart-sidebar__subtotal">
                      {fmt(producto.precio * cantidad)}
                    </span>
                    <div className="cart-sidebar__qty">
                      <button
                        onClick={() => updateQuantity(producto.id, cantidad - 1)}
                        className="cart-sidebar__qty-btn"
                        aria-label="Reducir cantidad"
                      >
                        −
                      </button>
                      <span>{cantidad}</span>
                      <button
                        onClick={() => updateQuantity(producto.id, cantidad + 1)}
                        className="cart-sidebar__qty-btn"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(producto.id)}
                        className="cart-sidebar__remove"
                        aria-label="Eliminar producto"
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span>Total</span>
              <span className="cart-sidebar__total-amount">{fmt(total)}</span>
            </div>
            <button
              className="cart-sidebar__checkout-btn"
              onClick={handleCheckout}
            >
              Ir al Checkout →
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;