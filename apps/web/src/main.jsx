import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth.jsx'
import SiteLayout from './layouts/SiteLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AgentsChat from './pages/AgentsChat.jsx'
import PortadasPreview from './pages/PortadasPreview.jsx'
import ModelosAdmin from './pages/ModelosAdmin.jsx'
import GenerarIA from './pages/GenerarIA.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import './index.css'
import './themes.css'

function PrivateRoute({ children }) {
  const { isLogged } = useAuth();
  return isLogged ? children : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      {
        path: 'app',
        element: <PrivateRoute><AppLayout /></PrivateRoute>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'agents', element: <AgentsChat /> },
          { path: 'portadas/preview', element: <PortadasPreview /> },
          { path: 'portadas/modelos', element: <ModelosAdmin /> },   // Owner
          { path: 'portadas/generar', element: <GenerarIA /> },
          { path: 'settings', element: <Settings /> },
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
)
