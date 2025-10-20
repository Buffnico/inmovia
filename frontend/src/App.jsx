import { useEffect, useState } from "react";
import { API_URL } from "./config";
import ClienteForm from "./components/ClienteForm";
import ClientesLista from "./components/ClientesLista";

export default function App() {
  const [apiMsg, setApiMsg] = useState("Comprobando backend...");

  useEffect(() => {
    fetch(`${API_URL}/api/ping`)
      .then((r) => r.json())
      .then((d) => setApiMsg(d?.message ?? "Sin respuesta"))
      .catch(() => setApiMsg("Backend aún no disponible"));
  }, []);

  const container = { fontFamily:"system-ui", padding:24, maxWidth:900, margin:"0 auto" };

  return (
    <div style={container}>
      <h1>Inmovia — Frontend</h1>
      <p>¡Hola! Esta es la interfaz de Inmovia.</p>
      <hr />
      <h2>Estado del backend</h2>
      <p>{apiMsg}</p>

      <hr />
      <h2>Datos del cliente</h2>
      <ClienteForm onCreated={() => { /* opcional: podríamos refrescar la lista vía event bus simple */ }} />

      <hr />
      <h2>Clientes</h2>
      <ClientesLista onDeleted={() => { /* idem */ }} />
    </div>
  );
}
