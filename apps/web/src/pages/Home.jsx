// apps/web/src/pages/Home.jsx
export default function Home() {
  return (
    <div className="landing">
      <div className="landing-wave-top" />
      <div className="landing__inner">
        <h1 className="landing__title">Inmovia Office</h1>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#/dashboard" className="landing__cta">Ingresar</a>
        </div>

        <div className="landing__tagline">
          Plataforma para oficinas: documentos, escáner avanzado, chat IA y capacitación (Edu).
        </div>
      </div>
    </div>
  );
}
