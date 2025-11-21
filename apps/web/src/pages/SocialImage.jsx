import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Editor simple para “Imagen para redes”
 * - Carga de foto base
 * - Campos: título, ubicación, precio
 * - Render a canvas 1080x1080
 * - Botón “Descargar JPG”
 */
export default function SocialImage() {
  const CANVAS_SIZE = 1080;
  const [title, setTitle] = useState("Departamento 3 ambientes de lujo");
  const [place, setPlace] = useState("Lomas de Zamora, Buenos Aires");
  const [price, setPrice] = useState("USD 120.000");
  const [img, setImg] = useState(null);

  const canvasRef = useRef(null);

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  function draw() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    // fondo
    ctx.clearRect(0,0,CANVAS_SIZE,CANVAS_SIZE);
    // base: vidrio azulado
    ctx.fillStyle = "#0a1222";
    ctx.fillRect(0,0,CANVAS_SIZE,CANVAS_SIZE);

    // imagen base (cover)
    if (img) {
      const r = img.width / img.height;
      const target = CANVAS_SIZE;
      let dw = target, dh = target;
      if (r > 1) { // horizontal
        dh = target;
        dw = dh * r;
      } else {    // vertical
        dw = target;
        dh = dw / r;
      }
      const dx = (target - dw) / 2;
      const dy = (target - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // overlay degradado abajo
    const grad = ctx.createLinearGradient(0, CANVAS_SIZE*0.55, 0, CANVAS_SIZE);
    grad.addColorStop(0, "rgba(5,12,26,0)");
    grad.addColorStop(1, "rgba(5,12,26,0.88)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, CANVAS_SIZE*0.48, CANVAS_SIZE, CANVAS_SIZE*0.52);

    // panel de info
    const pad = 36;
    const left = pad;
    let y = CANVAS_SIZE - pad - 160;

    // marca “Inmovia Office”
    ctx.fillStyle = "#EAF2FF";
    ctx.font = "700 34px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
    ctx.fillText("Inmovia Office", left, y);
    y += 18;

    // título
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 48px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
    wrapText(ctx, title, left, y+52, CANVAS_SIZE - pad*2, 52);

    // ubicación
    ctx.fillStyle = "#b7c9de";
    ctx.font = "600 28px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
    wrapText(ctx, place, left, CANVAS_SIZE - 90, CANVAS_SIZE - pad*2, 32);

    // precio (pill)
    const pill = {
      text: price,
      x: CANVAS_SIZE - pad - 380,
      y: CANVAS_SIZE - 64,
      w: 360,
      h: 56
    };
    roundRect(ctx, pill.x, pill.y, pill.w, pill.h, 28);
    const gradBtn = ctx.createLinearGradient(pill.x, pill.y, pill.x, pill.y + pill.h);
    gradBtn.addColorStop(0, "#0A49FF");
    gradBtn.addColorStop(1, "#2AA8FF");
    ctx.fillStyle = gradBtn;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "800 28px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pill.text, pill.x + pill.w/2, pill.y + pill.h/2);
    ctx.textAlign = "start"; // reset
  }

  function download() {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/jpeg", 0.92);
    a.download = "inmovia-social.jpg";
    a.click();
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, title, place, price]);

  return (
    <div className="app-main">
      <div className="glass-panel">
        <div className="dash-header" style={{ justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1 className="brand-title">Crear imagen para redes</h1>
            <p className="brand-sub">Componé una portada cuadrada 1080×1080 con tu estilo Inmovia.</p>
          </div>
          <Link className="btn" to="/documentos">Volver a Documentos</Link>
        </div>

        <div className="panel" style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:16 }}>
          <div>
            <label style={{ display:"block", marginBottom:6 }}>Foto base</label>
            <input type="file" accept="image/*" onChange={onPick} />

            <div className="scanner-bar" style={{ marginTop:12 }}>
              <label>Título</label>
              <input
                type="text"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                style={{ width:"100%", marginTop:6 }}
              />
            </div>

            <div className="scanner-bar">
              <label>Ubicación</label>
              <input
                type="text"
                value={place}
                onChange={(e)=>setPlace(e.target.value)}
                style={{ width:"100%", marginTop:6 }}
              />
            </div>

            <div className="scanner-bar">
              <label>Precio</label>
              <input
                type="text"
                value={price}
                onChange={(e)=>setPrice(e.target.value)}
                style={{ width:"100%", marginTop:6 }}
              />
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-primary" onClick={download}>Descargar JPG</button>
              <button className="btn" onClick={draw}>Actualizar preview</button>
            </div>
          </div>

          <div className="center" style={{ background:"rgba(8,20,44,.35)", borderRadius:14, border:"1px solid rgba(141,197,255,.14)" }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={{ width:"min(520px, 90%)", height:"auto", borderRadius:12 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== helpers dibujo =====
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = (text || "").split(" ");
  let line = "";
  let cursor = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, cursor);
      line = words[n] + " ";
      cursor += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, cursor);
}
