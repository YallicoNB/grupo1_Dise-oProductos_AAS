import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import "./styles/global.css";
import "./styles/index.scss";

import Products from "./pages/shop/Products";
import Cart from "./pages/shop/Cart";
import Booking from "./pages/shop/Booking";
import Checkout from "./pages/shop/Checkout";
import Confirmacion from "./pages/shop/Confirmacion";
import HistorialOrdenes from "./pages/shop/HistorialOrdenes";

import Services from "./pages/public/Services";
import Gallery from "./pages/public/Gallery";
import Home from "./pages/public/Home";

import ClientPanel from "./pages/client/ClientPanel";

import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminAuthGuard from "./pages/admin/AdminAuthGuard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminClients from "./pages/admin/AdminClients";
import AdminComplaints from "./pages/admin/AdminComplaints";

import { MainLayout } from "./layout/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "services", element: <Services /> },
      { path: "products", element: <Products /> },
      { path: "cart", element: <Cart /> },
      { path: "booking", element: <Booking /> },
      { path: "gallery", element: <Gallery /> },

      { path: "shop/checkout", element: <Checkout /> },
      { path: "shop/confirmacion", element: <Confirmacion /> },
      { path: "shop/historial", element: <HistorialOrdenes /> },

      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      { path: "client/panel", element: <ClientPanel /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminAuthGuard>
        <AdminLayout />
      </AdminAuthGuard>
    ),
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "calendar", element: <AdminCalendar /> },
      { path: "services", element: <AdminServices /> },
      { path: "inventory", element: <AdminInventory /> },
      { path: "gallery", element: <AdminGallery /> },
      { path: "clients", element: <AdminClients /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "tasks", element: <AdminTasks /> },
      { path: "complaints", element: <AdminComplaints /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;