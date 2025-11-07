import { useNavigate } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      {/* Onda superior sutil */}
      <div className="landing-wave-top" />
      <div className="landing__inner">
        <h1 className="landing__title">Inmovia</h1>
        <a className="landing__cta" href="#/dashboard">Ingresar</a>
        <div className="landing__tagline">La vía inteligente para tu inmobiliaria</div>
      </div>
    </div>
  );
}