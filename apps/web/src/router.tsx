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
import Carteles from "./pages/Carteles";
import PropiedadesDetalle from "./pages/PropiedadesDetalle";
import PropiedadesNueva from "./pages/PropiedadesNueva";
import Clientes from "./pages/Clientes";
import Documentos from "./pages/Documentos";
import Agenda from "./pages/Agenda";
import Edu from "./pages/Edu";
import EduModule from "./pages/EduModule";
import Ajustes from "./pages/Ajustes";
import ChatInterno from "./pages/ChatInterno";
import Whatsapp from "./pages/Whatsapp";
import Redes from "./pages/Redes";
import IvoT from "./pages/IvoT";
import ContactoDetalle from "./pages/ContactoDetalle";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import Perfil from "./pages/Perfil";
import ProtectedRoute from "./components/ProtectedRoute";
import ModuleRoute from "./components/ModuleRoute";
import RoleRoute from "./components/RoleRoute";
import { ROLES } from "./config/roles";


const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Home sin sidebar */}
          <Route index element={<Home />} />

          {/* Rutas internas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />

            {/* Módulos Protegidos */}
            <Route element={<ModuleRoute module="properties" />}>
              <Route path="propiedades" element={<Propiedades />} />
              <Route path="propiedades/nueva" element={<PropiedadesNueva />} />
              <Route path="propiedades/:id" element={<PropiedadesDetalle />} />
              <Route path="propiedades/:id/editar" element={<PropiedadesNueva />} />
              <Route path="carteles" element={<Carteles />} />
            </Route>

            <Route element={<ModuleRoute module="contacts" />}>
              <Route path="clientes" element={<Clientes />} />
              <Route path="contactos" element={<Clientes />} />
              <Route path="contactos/:id" element={<ContactoDetalle />} />
            </Route>

            <Route element={<ModuleRoute module="scanner" />}>
              <Route path="documentos/*" element={<Documentos />} />
            </Route>

            <Route element={<ModuleRoute module="agenda" />}>
              <Route path="agenda" element={<Agenda />} />
            </Route>

            <Route element={<ModuleRoute module="whatsapp" />}>
              <Route path="whatsapp" element={<Whatsapp />} />
            </Route>

            <Route element={<ModuleRoute module="social" />}>
              <Route path="redes" element={<Redes />} />
            </Route>

            <Route element={<ModuleRoute module="edu" />}>
              <Route path="edu" element={<Edu />} />
              <Route path="edu/:id" element={<EduModule />} />
            </Route>

            <Route element={<ModuleRoute module="ivot" />}>
              <Route path="ivot" element={<IvoT />} />
            </Route>

            <Route path="chat-interno" element={<ChatInterno />} />

            {/* Roles Protegidos */}
            <Route element={<RoleRoute allowedRoles={[ROLES.OWNER]} />}>
              <Route path="configuracion" element={<Ajustes />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={[ROLES.OWNER, ROLES.ADMIN]} />}>
              <Route path="usuarios" element={<Usuarios />} />
            </Route>

            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Sistema de Usuarios (Login público) */}
          <Route path="login" element={<Login />} />

          {/* Cualquier otra ruta → Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;
