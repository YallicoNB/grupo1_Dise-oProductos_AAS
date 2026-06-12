import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Producto } from "../types/_index";

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (producto: Producto) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type Action =
  | { type: "ADD"; producto: Producto }
  | { type: "UPDATE"; id: number; qty: number }
  | { type: "REMOVE"; id: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "LOAD":
      return action.items;
    case "ADD": {
      const existe = state.find((i) => i.producto.id === action.producto.id);
      if (existe) {
        return state.map((i) =>
          i.producto.id === action.producto.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...state, { producto: action.producto, cantidad: 1 }];
    }
    case "UPDATE":
      if (action.qty <= 0) {
        return state.filter((i) => i.producto.id !== action.id);
      }
      return state.map((i) =>
        i.producto.id === action.id ? { ...i, cantidad: action.qty } : i
      );
    case "REMOVE":
      return state.filter((i) => i.producto.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

const STORAGE_KEY = "cart_items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: "LOAD", items: JSON.parse(saved) });
      }
    } catch {
      // ignorar errores de parseo
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (producto: Producto) =>
    dispatch({ type: "ADD", producto });
  const updateQuantity = (id: number, qty: number) =>
    dispatch({ type: "UPDATE", id, qty });
  const removeItem = (id: number) => dispatch({ type: "REMOVE", id });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const total = items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeItem, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}