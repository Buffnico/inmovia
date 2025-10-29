import { useEffect, useState } from "react"
import { getHealth } from "../services/api"

export default function HealthStatus(){
  const [data,setData]=useState(null)
  const [err,setErr]=useState(null)
  const [loading,setLoading]=useState(true)

  async function load(){
    try{
      setLoading(true); setErr(null)
      const json = await getHealth()
      setData(json)
    }catch(e){
      setErr(e.message || "Error")
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ load() },[])

  if(loading) return <div style={{padding:12}}>⏳ Cargando estado</div>
  if(err) return <div style={{padding:12, color:"#b91c1c"}}> {err} <button onClick={load}>Reintentar</button></div>

  return (
    <div style={{ padding:16, marginTop:16, border:"1px solid #e2e8f0", borderRadius:12 }}>
      <h3 style={{marginTop:0}}>Estado de la API</h3>
      <ul style={{margin:"8px 0"}}>
        <li><b>ok:</b> {String(data.ok)}</li>
        <li><b>service:</b> {data.service}</li>
        <li><b>env:</b> {data.env || "development"}</li>
        <li><b>time:</b> {new Date(data.time).toLocaleString()}</li>
      </ul>
      <button onClick={load}>🔄 Refrescar</button>
    </div>
  )
}
