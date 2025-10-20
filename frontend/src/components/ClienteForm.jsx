import { useState } from "react";
import { API_URL } from "../config";

export default function ClienteForm({ onCreated }) {
  const [form, setForm] = useState({ nombre:"", apellido:"", dni:"", email:"", telefono:"" });
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === "dni" ? value.replace(/\D/g, "") : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.nombre.trim() || !form.apellido.trim() || !/^\d{7,10}$/.test(form.dni)) {
      return setMsg("Complete nombre, apellido y DNI (7–10 dígitos).");
    }
    try {
      setEnviando(true);
      const r = await fetch(`${API_URL}/api/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.message || "Error al guardar");
      setMsg(`Cliente #${d.id} guardado ✅`);
      setForm({ nombre:"", apellido:"", dni:"", email:"", telefono:"" });
      onCreated?.(d); // 👈 agrega al estado en App al instante
    } catch (e2) {
      setMsg(e2.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display:"grid", gap:10, marginTop:16 }}>
      <input name="nombre"   value={form.nombre}   onChange={onChange} placeholder="Nombre *" />
      <input name="apellido" value={form.apellido} onChange={onChange} placeholder="Apellido *" />
      <input name="dni"      value={form.dni}      onChange={onChange} placeholder="DNI * (solo números)" />
      <input name="email"    value={form.email}    onChange={onChange} placeholder="Email" />
      <input name="telefono" value={form.telefono} onChange={onChange} placeholder="Teléfono" />
      <button disabled={enviando}>{enviando ? "Enviando..." : "Guardar"}</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
