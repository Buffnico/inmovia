// apps/web/src/router.tsx
import React from "react";
import { createHashRouter } from "react-router-dom";

import App from "./App";

// Páginas existentes (comentá las que no tengas)
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Documentos from "./pages/Documentos";
import DocumentosScanner from "./pages/DocumentosScanner";
import Propiedades from "./pages/Propiedades";
// import NotFound from "./pages/NotFound.tsx"; // si no la tenés, comentá y sacá la ruta

// ✅ NUEVO: Inmovia Edu
import Edu from "./pages/Edu.jsx";
import EduModule from "./pages/EduModule.jsx";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "", element: <Home /> },
      { path: "documentos", element: <Documentos /> },
      { path: "documentos/escaner", element: <Documentos /> },
      { path: "propiedades", element: <Propiedades /> },
      { path: "edu", element: <Edu /> },
      { path: "edu/:id", element: <EduModule /> },

      // 👉 NUEVO: rutas de Edu
      { path: "edu", element: <Edu /> },
      { path: "edu/:id", element: <EduModule /> },

      // { path: "*", element: <NotFound /> }, // si no tenés NotFound, sacá esta línea
    ],
  },
]);

export default router;
