import { useEffect, useState } from "react";
import { api } from "../lib/api";

function todayISO(){ const d=new Date(); const mm=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0"); const yyyy=d.getFullYear(); return `${yyyy}-${mm}-${dd}`; }

export default function Reservations(){
  const [q,setQ]=useState("");
  const [rows,setRows]=useState([]);
  const [cliOpts,setCliOpts]=useState([]);
  const [propOpts,setPropOpts]=useState([]);
  const [msg,setMsg]=useState("");
  const [dbg,setDbg]=useState("");

  const load = async ()=>{
    const data = await api.listReservas(q);
    setRows(data.data||[]);
  };

  const fillOpts = async ()=>{
    const cs = await api.listClientes("");
    const ps = await api.listProps("");
    setCliOpts(cs.data||[]);
    setPropOpts(ps.data||[]);
  };

  useEffect(()=>{ load(); fillOpts(); },[]);

  const onSubmit = async (e)=>{
    e.preventDefault(); setMsg(""); setDbg("");
    const body = {
      id: e.target.id.value.trim(),
      dniCliente: e.target.dni.value.trim(),
      idPropiedad: e.target.pid.value.trim(),
      fecha: e.target.fecha.value,
      monto: Number(e.target.monto.value)||0,
      estado: e.target.estado.value
    };
    setDbg(JSON.stringify(body,null,2));
    if(!body.id || !body.dniCliente || !body.idPropiedad || !body.fecha){
      setMsg("❌ id, dniCliente, idPropiedad y fecha son obligatorios");
      return;
    }
    try{
      await api.createReserva(body);
      e.target.reset();
      e.target.fecha.value = todayISO();
      await load();
      setMsg("✔ Reserva creada");
      setDbg("");
    }catch(err){ setMsg("❌ "+err.message); }
  };

  const delIt = async (id)=>{
    if(!confirm("¿Eliminar reserva "+id+"?")) return;
    await api.deleteReserva(id);
    await load();
  };

  return (
    <div className="card">
      <div className="titleRow">
        <h2 style={{margin:0,fontSize:18}}>Reservas</h2>
        <div className="row">
          <input placeholder="Buscar reserva…" value={q} onChange={(e)=>setQ(e.target.value)} style={{width:220}}/>
          <button className="btn" onClick={load}>Buscar</button>
          <button className="btn" onClick={()=>{ setQ(""); load(); }}>Refrescar</button>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row" style={{gap:12}}>
          <div style={{flex:1}}><label>ID</label><input name="id" placeholder="R-0001" required/></div>

          <div style={{flex:1}}>
            <label>Cliente (DNI)</label>
            <input name="dni" list="dl_clientes" placeholder="Escribí o elegí DNI" required/>
            <datalist id="dl_clientes">
              {cliOpts.map(c=> <option key={c.dni} value={c.dni} label={`${c.dni} — ${c.nombre} ${c.apellido||""}`} />)}
            </datalist>
          </div>

          <div style={{flex:1}}>
            <label>Propiedad (ID)</label>
            <input name="pid" list="dl_props" placeholder="Escribí o elegí ID" required/>
            <datalist id="dl_props">
              {propOpts.map(p=> <option key={p.id} value={p.id} label={`${p.id} — ${p.tipo} — ${p.direccion}`} />)}
            </datalist>
          </div>
        </div>

        <div className="row" style={{gap:12, marginTop:6}}>
          <div style={{flex:1}}><label>Fecha</label><input name="fecha" type="date" defaultValue={todayISO()} required/></div>
          <div style={{flex:1}}><label>Monto</label><input name="monto" type="number" min="0" step="0.01" placeholder="1000"/></div>
          <div style={{flex:1}}><label>Estado</label>
            <select name="estado"><option>activa</option><option>cancelada</option><option>cumplida</option></select>
          </div>
        </div>

        <div className="row" style={{marginTop:10}}>
          <button className="btn primary" type="submit">Crear reserva</button>
          <span className="muted">{msg}</span>
        </div>
        {dbg && <pre className="muted" style={{whiteSpace:'pre-wrap', marginTop:6}}>{dbg}</pre>}
      </form>

      <table>
        <thead><tr><th>ID</th><th>Cliente</th><th>Propiedad</th><th>Fecha</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {rows.map(r=>{
            const cli = r._cliente ? `${r._cliente.dni} — ${r._cliente.nombre} ${r._cliente.apellido||""}` : r.dniCliente;
            const prop = r._propiedad ? `${r._propiedad.id} — ${r._propiedad.tipo} — ${r._propiedad.direccion}` : r.idPropiedad;
            return (
              <tr key={r.id}>
                <td>{r.id}</td><td>{cli}</td><td>{prop}</td><td>{r.fecha}</td><td>{r.monto}</td><td>{r.estado}</td>
                <td className="row-actions">
                  <a className="btn" href={api.docxReservaUrl(r.id)}>DOCX</a>
                  <button className="btn danger" onClick={()=>delIt(r.id)}>Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
