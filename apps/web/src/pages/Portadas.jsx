import { useState } from "react"
import { generarPortada } from "../services/portadas"

export default function Portadas() {
  const [form, setForm] = useState({
    direccion: "",
    precio: "",
    ambientes: "",
    superficie: "",
    imagen: ""
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(""); setPreview(null)
    try {
      const data = await generarPortada(form)
      setPreview(data.preview)
    } catch (err) {
      setError(err.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>🎨 Generar Portada IA</h1>
      <p>Completá los datos y generá una portada estética lista para redes.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <input placeholder="Dirección" required value={form.direccion}
          onChange={e => setForm({ ...form, direccion: e.target.value })} />
        <input placeholder="Precio (ej: USD 120.000)" required value={form.precio}
          onChange={e => setForm({ ...form, precio: e.target.value })} />
        <input placeholder="Ambientes (ej: 3)" required value={form.ambientes}
          onChange={e => setForm({ ...form, ambientes: e.target.value })} />
        <input placeholder="Superficie (m², ej: 85)" required value={form.superficie}
          onChange={e => setForm({ ...form, superficie: e.target.value })} />
        <input placeholder="URL de imagen (opcional)" value={form.imagen}
          onChange={e => setForm({ ...form, imagen: e.target.value })} />

        <button type="submit" disabled={loading} style={{
          backgroundColor: "#1E40AF",
          color: "white",
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}>
          {loading ? "Generando..." : "Generar Portada"}
        </button>
      </form>

      {error && (
        <div style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA"
        }}>
          {error}
        </div>
      )}

      {preview && (
        <div style={{
          marginTop: 30,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          background: `linear-gradient(135deg, ${preview.colorPrincipal}, #3B82F6)`,
          color: "white",
          textAlign: "center"
        }}>
          <img src={preview.imagen} alt="preview" style={{ width: "100%", height: "auto" }} />
          <div style={{ padding: 20 }}>
            <h2 style={{ margin: 0 }}>{preview.direccion}</h2>
            <p style={{ fontSize: 20, margin: "8px 0" }}>{preview.precio}</p>
            <p>{preview.ambientes} ambientes · {preview.superficie} m²</p>
          </div>
        </div>
      )}
    </div>
  )
}
