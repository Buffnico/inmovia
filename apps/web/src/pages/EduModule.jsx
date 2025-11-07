import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function EduModule() {
  const { id } = useParams();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/edu/modules/${id}`);
        if (!res.ok) throw new Error("No se encontró el módulo");
        const data = await res.json();
        setMod(data);
      } catch (e) {
        // Fallback local si la API no está
        const defaults = {
          "captacion-pro": {
            id:"captacion-pro", title:"Captación PRO",
            summary:"Método paso a paso para captar propietarios.",
            lessons:8, duration:55, level:"Intermedio", paid:true,
            contents:[
              "Prospección y segmentación","Guion y objeciones","Visita y checklist",
              "Presentación de servicios","Seguimiento y cierre","Plantillas",
              "KPIs semanales","Bonus: Objeciones difíciles"
            ]
          },
          "fotografia-movil": {
            id:"fotografia-movil", title:"Fotografía con celular",
            summary:"Composición y luz con el flujo del escáner Inmovia.",
            lessons:5, duration:32, level:"Básico", paid:false,
            contents:["Ajustes del móvil","Luz","Encuadre","Postpro con escáner","Entrega"]
          }
        };
        setMod(defaults[id] ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function askAI(e){
    e.preventDefault();
    if(!question.trim()) return;
    setAnswers(prev => [...prev, { q: question, a: "Respuesta de IA (placeholder). Luego se conecta al backend." }]);
    setQuestion("");
  }

  if (loading) return <div className="container" style={{padding:"24px 0"}}><div className="glass-panel">Cargando…</div></div>;
  if (!mod) return <div className="container" style={{padding:"24px 0"}}><div className="glass-panel">No se encontró el módulo.</div></div>;

  return (
    <div className="container" style={{padding:"24px 0", display:"grid", gap:"18px", gridTemplateColumns:"1fr 360px"}}>
      <div className="glass-panel">
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px"}}>
          <h1 style={{margin:0}}>{mod.title}</h1>
          <Link to="/edu" style={{textDecoration:"none"}}>Volver</Link>
        </div>
        <p className="muted" style={{margin:"6px 0 14px"}}>{mod.summary}</p>

        <h3 style={{margin:"0 0 8px"}}>Contenido</h3>
        <ul style={{margin:"0 0 6px 18px"}}>
          {mod.contents?.map((c,i)=>(<li key={i}>{c}</li>))}
        </ul>
        <div className="muted" style={{fontSize:"13px"}}>
          {mod.lessons} lecciones · {mod.duration} min · Nivel {mod.level}
        </div>
        {mod.paid && (
          <div className="muted" style={{marginTop:"8px", fontSize:"12px"}}>
            *Este módulo pertenece a Inmovia Edu (acceso por suscripción).
          </div>
        )}
      </div>

      <aside className="glass-panel" style={{position:"sticky", top:"20px"}}>
        <h3 style={{marginTop:0}}>Estudiar con IA</h3>
        <p className="muted" style={{marginTop:"6px"}}>Haz preguntas sobre este módulo. (La IA real se conecta en la siguiente fase).</p>

        <form onSubmit={askAI} style={{marginTop:"10px"}}>
          <textarea
            value={question}
            onChange={e=>setQuestion(e.target.value)}
            rows={4}
            style={{
              width:"100%", borderRadius:"12px", padding:"10px",
              border:"1px solid rgba(141,197,255,.14)", background:"rgba(18,36,55,.4)",
              color:"#EAF2FF", resize:"vertical"
            }}
            placeholder="Escribe tu duda…"
          />
          <button
            type="submit"
            style={{
              marginTop:"10px", width:"100%", height:"44px", borderRadius:"999px",
              border:"1px solid rgba(255,255,255,.08)",
              background:"linear-gradient(180deg, var(--brand) 0%, var(--brand-2) 100%)",
              color:"#fff", fontWeight:700
            }}
          >
            Preguntar
          </button>
        </form>

        <div style={{marginTop:"12px", display:"grid", gap:"10px", maxHeight:"42vh", overflow:"auto"}}>
          {answers.map((x,i)=>(
            <div key={i} className="glass-panel" style={{padding:"12px"}}>
              <div className="muted" style={{fontSize:"12px"}}>Tú:</div>
              <div>{x.q}</div>
              <div className="muted" style={{fontSize:"12px", marginTop:"8px"}}>IA:</div>
              <div>{x.a}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
