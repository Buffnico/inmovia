const BASE = import.meta.env.VITE_API_BASE || '/api';

async function jsonOrError(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}

export async function ping() {
  const res = await fetch(`${BASE}/ping`);
  return jsonOrError(res);
}

export async function getModelos() {
  const res = await fetch(`${BASE}/portadas/modelos`);
  return jsonOrError(res);
}

export async function uploadModelo({ file, nombre, descripcion }) {
  const fd = new FormData();
  fd.append('archivo', file);
  fd.append('nombre', nombre);
  if (descripcion) fd.append('descripcion', descripcion);
  const res = await fetch(`${BASE}/portadas/modelos/upload`, { method: 'POST', body: fd });
  return jsonOrError(res);
}

export async function deleteModelo(id) {
  const res = await fetch(`${BASE}/portadas/modelos/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return jsonOrError(res);
}

export async function postPreview(payload) {
  const res = await fetch(`${BASE}/portadas/preview`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  return jsonOrError(res);
}

export async function instanciarPortada(payload) {
  const res = await fetch(`${BASE}/portadas/instanciar`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(payload)
  });
  return jsonOrError(res);
}
