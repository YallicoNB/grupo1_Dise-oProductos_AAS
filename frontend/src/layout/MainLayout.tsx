import React from "react";
import Footer from "../components/layouts/Footer";
import Navbar from "../components/layouts/Navbar";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
