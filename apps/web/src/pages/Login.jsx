import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Login(){
  const [email,setEmail]=useState("owner@inmovia.com");
  const [pass,setPass]=useState("123456");
  const [err,setErr]=useState("");
  const login = useAuth(s=>s.login);
  const navigate = useNavigate();

  const onSubmit = async (e)=>{
    e.preventDefault();
    const ok = await login(email,pass);
    if(!ok) setErr("Credenciales inválidas");
    else navigate("/", {replace:true});
  };

  return (
    <div className="login-hero">
      <div className="card login-card">
        <div className="login-title">Inmovia</div>
        <form onSubmit={onSubmit} className="row" style={{flexDirection:"column", gap:12}}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className="input" placeholder="Contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)}/>
          {err && <div className="muted" style={{color:"#ff9b9b"}}>{err}</div>}
          <button className="btn btn-lg" type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}
