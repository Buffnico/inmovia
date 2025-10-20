import { useState } from "react";
import { API_URL } from "../config";

export default function ClienteForm({ onCreated }) {
  const [form, setForm] = useState({ nombre:"", apellido:"", dni:"", email:"", telefono:"" });
  const [enviando, setEnviando] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    // DNI: sólo números
    if (name === "dni") {
      const v = value.replace(/\D/g, "");
      return setForm(f => ({ ...f, [name]: v }));
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const validar = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (!form.apellido.trim()) return "El apellido es obligatorio";
    if (!/^\d{7,10}$/.test(form.dni)) return "DNI debe tener 7 a 10 dígitos";
    if (form.email && !/.+@.+\..+/.test(form.email)) return "Email inválido";
    if (form.telefono && !/^\+?\d{6,15}$/.test(form.telefono)) return "Teléfono inválido";
    return null;
  };

  const toast = (msg, error = false) => {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.position = "fixed";
    el.style.bottom = "24px";
    el.style.right = "24px";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "8px";
    el.style.background = error ? "#ffdddd" : "#ddffdd";
    el.style.border = `1px solid ${error ? "#ff9a9a" : "#8ad48a"}`;
    el.style.zIndex = 9999;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validar();
    if (msg) return toast(msg, true);

    try {
      setEnviando(true);
      const res = await fetch(`${API_URL}/api/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error al guardar");
      toast(`Cliente #${data.id} guardado`);
      setForm({ nombre:"", apellido:"", dni:"", email:"", telefono:"" });
      onCreated?.(data);
    } catch (err) {
      toast(err.message || "Error al guardar", true);
    } finally {
      setEnviando(false);
    }
  };

  const input = { padding:"8px 10px", border:"1px solid #ddd", borderRadius:8 };
  const row = { display:"grid", gap:4 };

  return (
    <form onSubmit={onSubmit} style={{ display:"grid", gap:12, marginTop: 16 }}>
      <div style={row}><label>Nombre *</label>
        <input name="nombre" value={form.nombre} onChange={onChange} style={input} required />
      </div>
      <div style={row}><label>Apellido *</label>
        <input name="apellido" value={form.apellido} onChange={onChange} style={input} required />
      </div>
      <div style={row}><label>DNI *</label>
        <input name="dni" value={form.dni} onChange={onChange} style={input} placeholder="Solo números" required />
      </div>
      <div style={row}><label>Email</label>
        <input name="email" value={form.email} onChange={onChange} style={input} placeholder="opcional" />
      </div>
      <div style={row}><label>Teléfono</label>
        <input name="telefono" value={form.telefono} onChange={onChange} style={input} placeholder="+54..." />
      </div>

      <button type="submit" disabled={enviando} style={{ padding:"8px 12px", borderRadius:8 }}>
        {enviando ? "Enviando..." : "Guardar cliente"}
      </button>
    </form>
  );
}
