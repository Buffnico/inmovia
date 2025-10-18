// src/App.jsx
import { useEffect, useState } from "react";
import { API_URL } from "./config";

export default function App() {
  const [apiMsg, setApiMsg] = useState("Comprobando backend...");

  useEffect(() => {
    // Intento de conexión al backend (lo crearemos enseguida)
    fetch(`${API_URL}/api/ping`)
      .then((r) => r.json())
      .then((data) => setApiMsg(data?.message ?? "Sin respuesta"))
      .catch(() => setApiMsg("Backend aún no disponible"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Inmovia — Frontend</h1>
      <p>¡Hola! Esta es la interfaz de Inmovia.</p>
      <hr />
      <h2>Estado del backend</h2>
      <p>{apiMsg}</p>
    </div>
  );
}
