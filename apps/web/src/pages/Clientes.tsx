import React from "react";

const Clientes: React.FC = () => {
  return (
    <div className="page">
      <div className="glass-panel">
        <h1 className="page-title">Clientes</h1>
        <p className="page-subtitle">
          Acá vas a poder gestionar tus clientes de Inmovia Office.
        </p>

        <div className="cards">
          <div className="card">
            <h2 className="card-title">Listado de clientes</h2>
            <p className="card-text">
              Próximamente vas a ver acá el listado de clientes, filtros y
              acciones rápidas.
            </p>
          </div>

          <div className="card">
            <h2 className="card-title">Nuevo cliente</h2>
            <p className="card-text">
              Más adelante vas a poder cargar clientes manualmente o desde otras
              herramientas (Ivo-t, integraciones, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
