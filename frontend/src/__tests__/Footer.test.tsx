import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "../components/layouts/Footer";

describe("Footer Component", () => {
  test("debe mostrar el nombre de la marca Antonela Art", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Antonela Art/i)).toBeInTheDocument();
  });
});
