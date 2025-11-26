import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router";
import { OfficeProvider } from "./context/OfficeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OfficeProvider>
      <AppRouter />
    </OfficeProvider>
  </React.StrictMode>
);
