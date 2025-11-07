// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
export default function NotFound(){
  return (
    <div className="container">
      <h1 className="h1">Página no encontrada</h1>
      <p className="muted">La ruta no existe o fue movida.</p>
      <Link to="/" className="btn">Volver al inicio</Link>
    </div>
  );
}
