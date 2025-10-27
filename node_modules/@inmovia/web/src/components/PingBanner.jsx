import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function PingBanner() {
  const [state, setState] = useState("?");
  const [msg, setMsg] = useState("");

  const run = async () => {
    try {
      const out = await api.ping();
      setMsg(JSON.stringify(out));
      setState("OK");
    } catch (e) {
      setMsg(e.message);
      setState("ERROR");
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="row">
        <button className="btn" onClick={run}>Probar /api/ping</button>
        <span className="tag">API: <span className={state === "OK" ? "ok" : "danger-txt"}>{state}</span></span>
        <span className="muted">{msg}</span>
      </div>
    </div>
  );
}
