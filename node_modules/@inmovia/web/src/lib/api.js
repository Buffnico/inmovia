// 🔒 Forzado a localhost:3001 para evitar líos de .env o proxy
const BASE = 'http://localhost:3001';

async function request(path, opts = {}) {
  console.log('[API] →', BASE + path); // debug visible en consola del navegador
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  // Si la conexión falla, este .json() puede romper; por eso el catch
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error de red');
  return data;
}

export const api = {
  ping: () => request('/api/ping'),
  listClientes: (q = '') => request(`/api/clientes?q=${encodeURIComponent(q)}&limit=1000`),
  createCliente: (body) => request('/api/clientes', { method: 'POST', body: JSON.stringify(body) }),
  deleteCliente: (dni) => request(`/api/clientes/${dni}`, { method: 'DELETE' }),

  listProps: (q = '') => request(`/api/propiedades?q=${encodeURIComponent(q)}&limit=1000`),
  createProp: (body) => request('/api/propiedades', { method: 'POST', body: JSON.stringify(body) }),
  deleteProp: (id) => request(`/api/propiedades/${id}`, { method: 'DELETE' }),

  listReservas: (q = '') => request(`/api/reservas?q=${encodeURIComponent(q)}&limit=1000`),
  createReserva: (body) => request('/api/reservas', { method: 'POST', body: JSON.stringify(body) }),
  deleteReserva: (id) => request(`/api/reservas/${id}`, { method: 'DELETE' }),
  docxReservaUrl: (id) => `${BASE}/api/reservas/${id}/docx`,
};
