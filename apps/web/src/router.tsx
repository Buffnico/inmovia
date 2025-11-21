// apps/web/src/router.tsx
import React from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import App from "./App";

// Páginas
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Propiedades from "./pages/Propiedades";
import Clientes from "./pages/Clientes";
import Documentos from "./pages/Documentos";
import Agenda from "./pages/Agenda";
import Edu from "./pages/Edu";
import Ajustes from "./pages/Ajustes";
import ChatInterno from "./pages/ChatInterno";
import Whatsapp from "./pages/Whatsapp";
import Redes from "./pages/Redes";
import IvoT from "./pages/IvoT";

const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Home sin sidebar */}
          <Route index element={<Home />} />

          {/* Rutas internas */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="propiedades" element={<Propiedades />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="documentos/*" element={<Documentos />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="chat-interno" element={<ChatInterno />} />
          <Route path="whatsapp" element={<Whatsapp />} />
          <Route path="redes" element={<Redes />} />
          <Route path="edu" element={<Edu />} />
          <Route path="configuracion" element={<Ajustes />} />

          {/* Centro de Ivo-t (pantalla completa) */}
          <Route path="ivot" element={<IvoT />} />

          {/* Cualquier otra ruta → Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;
