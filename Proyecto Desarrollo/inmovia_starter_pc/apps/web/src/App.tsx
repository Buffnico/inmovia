import React, { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState<string>('Checking API...')
  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then(r => r.json())
      .then(() => setStatus('API OK'))
      .catch(() => setStatus('API OFF'))
  }, [])
  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24 }}>
      <h1 style={{ color: '#3B82F6', marginBottom: 8 }}>Inmovia</h1>
      <p>La vía inteligente para tu inmobiliaria.</p>
      <hr style={{ margin: '16px 0' }} />
      <p>Estado del backend: <b>{status}</b></p>
    </div>
  )
}