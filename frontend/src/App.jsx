import { useEffect, useState } from "react";
import { API_URL } from "./config";
import ClienteForm from "./components/ClienteForm";
import ClientesLista from "./components/ClientesLista";

export default function App() {
  const [apiMsg, setApiMsg] = useState("Comprobando backend...");
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Saludo del backend
  useEffect(() => {
    fetch(`${API_URL}/api/ping`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => setApiMsg(d?.message ?? "Sin respuesta"))
      .catch(() => setApiMsg("Backend aún no disponible"));
  }, []);

  // Cargar lista inicial (y podés reutilizar cuando quieras)
  const loadClientes = async () => {
    try {
      setCargando(true);
      setError(null);
      const r = await fetch(`${API_URL}/api/clientes?ts=${Date.now()}`, { cache: "no-store" });
      const data = await r.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setError("No pude cargar los clientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // 👉 se llama cuando el form crea un cliente OK (actualización optimista)
  const handleCreated = (nuevo) => {
    setClientes(prev => [nuevo, ...prev]);
  };

  // 👉 se llama cuando la lista elimina un cliente OK (actualización optimista)
  const handleDeleted = (id) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{ fontFamily:"system-ui", padding:24, maxWidth:900, margin:"0 auto" }}>
      <h1>Inmovia — Frontend</h1>

      <h2>Estado del backend</h2>
      <p>{apiMsg}</p>

      <hr />
      <h2>Datos del cliente</h2>
      <ClienteForm onCreated={handleCreated} />

      <hr />
      <h2>Clientes</h2>
      <button onClick={loadClientes} style={{ marginBottom: 10 }}>Recargar</button>
      {cargando && <p>Cargando clientes…</p>}
      {error && <p style={{ color:"red" }}>{error}</p>}
      {!cargando && !error && (
        <ClientesLista items={clientes} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
