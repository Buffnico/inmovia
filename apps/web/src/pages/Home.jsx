import HealthStatus from '../components/HealthStatus.jsx';

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Inmovia Office</h1>
      <p>Frontend listo con Vite + React.</p>
      <HealthStatus />
    </div>
  );
}
