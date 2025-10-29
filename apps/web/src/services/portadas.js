export async function generarPortada(payload) {
  const res = await fetch("/api/portadas/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = "request failed";
    try { msg = JSON.parse(text).message || msg; } catch {}
    throw new Error(`API ${res.status}: ${msg}`);
  }
  try { return JSON.parse(text); } catch { throw new Error("Respuesta inválida de la API"); }
}
