import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="wrap">
      <header>
        <div className="logo" />
        <h1>Inmovia · Backoffice</h1>
        <nav>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          <NavLink to="/propiedades">Propiedades</NavLink>
          <NavLink to="/reservas">Reservas</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
