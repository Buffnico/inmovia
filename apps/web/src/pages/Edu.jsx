import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Edu() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/edu/modules");
        if (!res.ok) throw new Error("No se pudo cargar Inmovia Edu");
        const data = await res.json();
        setMods(data);
      } catch (e) {
        // Fallback: muestra algo aun si no está montada la API
        setMods([
          { id:"captacion-pro", title:"Captación PRO", summary:"Método paso a paso para captar propietarios y cerrar acuerdos.", lessons:8, duration:55, level:"Intermedio", paid:true },
          { id:"fotografia-movil", title:"Fotografía con celular", summary:"Composición, luz y flujo con el escáner de Inmovia.", lessons:5, duration:32, level:"Básico", paid:false },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container" style={{padding:"24px 0"}}>
      <div className="glass-panel" style={{marginBottom:"18px"}}>
        <h1 style={{margin:"0 0 6px 0"}}>Inmovia Edu</h1>
        <p className="muted" style={{margin:0}}>
          Módulos de aprendizaje subidos por la oficina. (Sección paga)
        </p>
      </div>

      {loading && <div className="glass-panel">Cargando…</div>}
      {err && <div className="glass-panel" style={{color:"#ff9b9b"}}>{err}</div>}

      <div className="cards">
        {mods.map(m => (
          <Link
            key={m.id}
            to={`/edu/${m.id}`}
            className="card"
            style={{textDecoration:"none", color:"inherit"}}
          >
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"12px"}}>
              <h3 style={{margin:0}}>{m.title}</h3>
              {m.paid && (
                <span style={{
                  fontSize:"12px", padding:"4px 8px", borderRadius:"999px",
                  border:"1px solid rgba(55,168,255,.22)", background:"rgba(55,168,255,.10)"
                }}>
                  Pago
                </span>
              )}
            </div>
            <p className="muted" style={{margin:"8px 0 10px"}}>{m.summary}</p>
            <div className="muted" style={{fontSize:"13px"}}>
              {m.lessons} lecciones · {m.duration} min · Nivel {m.level}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
