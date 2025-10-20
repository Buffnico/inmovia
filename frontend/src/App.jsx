import { useEffect, useState } from "react";
import { API_URL } from "./config";
import ClienteForm from "./components/ClienteForm";
import ClientesLista from "./components/ClientesLista";

export default function App() {
  const [apiMsg, setApiMsg] = useState("Comprobando backend...");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/api/ping`)
      .then((r) => r.json())
      .then((d) => setApiMsg(d?.message ?? "Sin respuesta"))
      .catch(() => setApiMsg("Backend aún no disponible"));
  }, []);

  const triggerRefresh = () => setRefreshToken((n) => n + 1);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Inmovia — Frontend</h1>
      <hr />
      <h2>Estado del backend</h2>
      <p>{apiMsg}</p>

      <hr />
      <h2>Datos del cliente</h2>
      <ClienteForm onCreated={triggerRefresh} />

      <hr />
      <h2>Clientes</h2>
      <ClientesLista refreshToken={refreshToken} onDeleted={triggerRefresh} />
    </div>
  );
}
