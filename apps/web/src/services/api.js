export async function getHealth() {
  const res = await fetch('/api/health', { credentials: 'include' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || 'request failed'}`)
  }
  return res.json()
}
