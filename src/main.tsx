// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // <-- Impor
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* <--- BUNGKUS PALING LUAR */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>{" "}
    {/* <--- TUTUP DI SINI */}
  </React.StrictMode>
);
