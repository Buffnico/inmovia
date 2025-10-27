import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Clients() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const data = await api.listClientes(q);
    setRows(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault(); setMsg("");
    const body = {
      dni: e.target.dni.value.trim(),
      nombre: e.target.nombre.value.trim(),
      apellido: e.target.apellido.value.trim(),
      telefono: e.target.telefono.value.trim(),
      email: e.target.email.value.trim()
    };
    if (!body.dni || !body.nombre) { setMsg("dni y nombre son obligatorios"); return; }
    try {
      await api.createCliente(body);
      e.target.reset();
      await load();
      setMsg("✔ Cliente creado");
    } catch (err) { setMsg("❌ " + err.message); }
  };

  const delIt = async (dni) => {
    if (!confirm("¿Eliminar cliente " + dni + "?")) return;
    await api.deleteCliente(dni);
    await load();
  };

  return (
    <>
      <div className="card">
        <div className="titleRow">
          <h2 style={{margin:0,fontSize:18}}>Clientes</h2>
          <div className="row">
            <input placeholder="Buscar cliente…" value={q} onChange={(e)=>setQ(e.target.value)} style={{width:220}} />
            <button className="btn" onClick={load}>Buscar</button>
            <button className="btn" onClick={()=>{ setQ(""); load(); }}>Refrescar</button>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="row" style={{gap:12}}>
            <div style={{flex:1}}><label>DNI</label><input name="dni" required placeholder="12345678"/></div>
            <div style={{flex:1}}><label>Nombre</label><input name="nombre" required placeholder="Juan"/></div>
            <div style={{flex:1}}><label>Apellido</label><input name="apellido" placeholder="Pérez"/></div>
          </div>
          <div className="row" style={{gap:12,marginTop:6}}>
            <div style={{flex:1}}><label>Teléfono</label><input name="telefono" placeholder="11-1234-5678"/></div>
            <div style={{flex:1}}><label>Email</label><input name="email" type="email" placeholder="juan@mail.com"/></div>
          </div>
          <div className="row" style={{marginTop:10}}>
            <button className="btn primary" type="submit">Crear cliente</button>
            <span className="muted">{msg}</span>
          </div>
        </form>
        <table>
          <thead><tr><th>DNI</th><th>Nombre</th><th>Apellido</th><th>Teléfono</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {rows.map(c=>(
              <tr key={c.dni}>
                <td>{c.dni}</td><td>{c.nombre}</td><td>{c.apellido||""}</td><td>{c.telefono||""}</td><td>{c.email||""}</td>
                <td className="row-actions"><button className="btn danger" onClick={()=>delIt(c.dni)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
