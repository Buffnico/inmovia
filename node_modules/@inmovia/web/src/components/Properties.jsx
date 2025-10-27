import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Properties() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const data = await api.listProps(q);
    setRows(data.data || []);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault(); setMsg("");
    const body = {
      id: e.target.id.value.trim(),
      tipo: e.target.tipo.value.trim(),
      direccion: e.target.direccion.value.trim(),
      localidad: e.target.localidad.value.trim(),
      ambientes: Number(e.target.ambientes.value),
      precioUSD: Number(e.target.precioUSD.value)
    };
    if (!body.id || !body.tipo || !body.direccion) { setMsg("id, tipo y direccion son obligatorios"); return; }
    try {
      await api.createProp(body);
      e.target.reset();
      await load();
      setMsg("✔ Propiedad creada");
    } catch (err) { setMsg("❌ " + err.message); }
  };

  const delIt = async (id) => {
    if (!confirm("¿Eliminar propiedad " + id + "?")) return;
    await api.deleteProp(id);
    await load();
  };

  return (
    <div className="card">
      <div className="titleRow">
        <h2 style={{margin:0,fontSize:18}}>Propiedades</h2>
        <div className="row">
          <input placeholder="Buscar propiedad…" value={q} onChange={(e)=>setQ(e.target.value)} style={{width:220}} />
          <button className="btn" onClick={load}>Buscar</button>
          <button className="btn" onClick={()=>{ setQ(""); load(); }}>Refrescar</button>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div className="row" style={{gap:12}}>
          <div style={{flex:1}}><label>ID</label><input name="id" placeholder="P-0001" required/></div>
          <div style={{flex:1}}><label>Tipo</label>
            <select name="tipo">
              <option>Departamento</option><option>Casa</option><option>PH</option><option>Lote</option><option>Local</option>
            </select>
          </div>
        </div>
        <div className="row" style={{gap:12,marginTop:6}}>
          <div style={{flex:2}}><label>Dirección</label><input name="direccion" required placeholder="Av. Alsina 770"/></div>
          <div style={{flex:1}}><label>Localidad</label><input name="localidad" placeholder="Lomas de Zamora"/></div>
        </div>
        <div className="row" style={{gap:12,marginTop:6}}>
          <div style={{flex:1}}><label>Ambientes</label><input name="ambientes" type="number" min="0" step="1" placeholder="3"/></div>
          <div style={{flex:1}}><label>Precio USD</label><input name="precioUSD" type="number" min="0" step="0.01" placeholder="120000"/></div>
        </div>
        <div className="row" style={{marginTop:10}}>
          <button className="btn primary" type="submit">Crear propiedad</button>
          <span className="muted">{msg}</span>
        </div>
      </form>
      <table>
        <thead><tr><th>ID</th><th>Tipo</th><th>Dirección</th><th>Localidad</th><th>Amb</th><th>USD</th><th></th></tr></thead>
        <tbody>
          {rows.map(p=>(
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.tipo}</td><td>{p.direccion}</td><td>{p.localidad||""}</td><td>{p.ambientes??""}</td><td>{p.precioUSD??""}</td>
              <td className="row-actions"><button className="btn danger" onClick={()=>delIt(p.id)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
