import { Routes, Route, Link } from "react-router-dom";
import Layout from "./components/Layout";
import PingBanner from "./components/PingBanner";
import Clients from "./components/Clients";
import Properties from "./components/Properties";
import Reservations from "./components/Reservations";

function Home(){
  return (
    <>
      <PingBanner />
      <div className="grid">
        <div className="card">
          <h2 style={{marginTop:0}}>Clientes</h2>
          <p className="muted">Gestioná altas y bajas de clientes.</p>
          <Link className="btn" to="/clientes">Ir a Clientes</Link>
        </div>
        <div className="card">
          <h2 style={{marginTop:0}}>Propiedades</h2>
          <p className="muted">Cargá propiedades con datos clave.</p>
          <Link className="btn" to="/propiedades">Ir a Propiedades</Link>
        </div>
      </div>
      <div className="card" style={{marginTop:18}}>
        <h2 style={{marginTop:0}}>Reservas</h2>
        <p className="muted">Creá reservas vinculando cliente + propiedad + fecha + monto. Descargá DOCX de la reserva.</p>
        <Link className="btn" to="/reservas">Ir a Reservas</Link>
      </div>
    </>
  );
}

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Inmovia Office</h1>
      <p>Frontend listo con Vite + React.</p>
    </div>
  )
}
