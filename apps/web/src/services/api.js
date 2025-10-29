export async function getHealth(){
  const res = await fetch("/api/health")
  if(!res.ok){
    const t = await res.text().catch(()=> "")
    throw new Error(`API ${res.status}: ${t || "request failed"}`)
  }
  return res.json()
}
