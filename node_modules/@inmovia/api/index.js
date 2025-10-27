<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Tester Inmovia - Clientes · Propiedades · Reservas</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, Arial, sans-serif; margin: 24px; }
    h1 { margin: 0 0 16px }
    form, .card { border: 1px solid #ddd; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    label { display: block; margin: 6px 0 4px; font-size: 14px; }
    input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
    button { padding: 10px 14px; border: 0; border-radius: 6px; cursor: pointer; }
    .primary { background: #0d6efd; color: white; }
    .ghost { background: #eee; }
    .muted { color: #666; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; }
    .row-actions { display: flex; gap: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 1200px) { .grid { grid-template-columns: 1fr; } }
    .section { margin-top: 24px; }
  </style>
</head>
<body>
  <h1>Tester Inmovia — Clientes · Propiedades · Reservas</h1>

  <div class="card">
    <strong>Ping API:</strong>
    <button class="ghost" id="btnPing">/api/ping</button>
    <span id="pingOut" class="muted"></span>
  </div>

  <div class="grid">
    <!-- CLIENTES -->
    <div class="section">
      <form id="formCliente">
        <h2>Nuevo cliente</h2>
        <label>DNI</label><input id="c_dni" required />
        <label>Nombre</label><input id="c_nombre" required />
        <label>Apellido</label><input id="c_apellido" />
        <label>Teléfono</label><input id="c_telefono" />
        <label>Email</label><input id="c_email" type="email" />
        <div style="margin-top:10px"><button class="primary" type="submit">Crear</button></div>
        <div id="c_msg" class="muted"></div>
      </form>
      <div class="card">
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
          <input id="c_q" placeholder="Buscar cliente…" />
          <button class="ghost" id="c_btnBuscar">Buscar</button>
          <button class="ghost" id="c_btnRefrescar">Refrescar</button>
        </div>
        <table>
          <thead><tr><th>DNI</th><th>Nombre</th><th>Apellido</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
          <tbody id="c_tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- PROPIEDADES -->
    <div class="section">
      <form id="formProp">
        <h2>Nueva propiedad</h2>
        <label>ID</label><input id="p_id" placeholder="P-0001" required />
        <label>Tipo</label>
        <select id="p_tipo">
          <option>Departamento</option><option>Casa</option><option>PH</option><option>Lote</option><option>Local</option>
        </select>
        <label>Dirección</label><input id="p_direccion" required />
        <label>Localidad</label><input id="p_localidad" />
        <label>Ambientes</label><input id="p_ambientes" type="number" min="0" step="1" />
        <label>Precio USD</label><input id="p_precio" type="number" min="0" step="0.01" />
        <div style="margin-top:10px"><button class="primary" type="submit">Crear</button></div>
        <div id="p_msg" class="muted"></div>
      </form>
      <div class="card">
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
          <input id="p_q" placeholder="Buscar propiedad…" />
          <button class="ghost" id="p_btnBuscar">Buscar</button>
          <button class="ghost" id="p_btnRefrescar">Refrescar</button>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Tipo</th><th>Dirección</th><th>Localidad</th><th>Amb</th><th>USD</th><th>Acciones</th></tr></thead>
          <tbody id="p_tbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- RESERVAS -->
  <div class="section">
    <form id="formRes">
      <h2>Nueva reserva</h2>
      <label>ID</label><input id="r_id" placeholder="R-0001" required />
      <label>Cliente (DNI)</label>
      <select id="r_dni" required>
        <option value="" selected disabled>— seleccionar cliente —</option>
      </select>
      <label>Propiedad (ID)</label>
      <select id="r_prop" required>
        <option value="" selected disabled>— seleccionar propiedad —</option>
      </select>
      <label>Fecha</label><input id="r_fecha" type="date" required />
      <label>Monto</label><input id="r_monto" type="number" min="0" step="0.01" />
      <label>Estado</label>
      <select id="r_estado">
        <option>activa</option><option>cancelada</option><option>cumplida</option>
      </select>
      <div style="margin-top:10px">
        <button class="primary" id="r_btnSubmit" type="submit" disabled>Crear</button>
      </div>
      <div id="r_msg" class="muted"></div>
    </form>

    <div class="card">
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
        <input id="r_q" placeholder="Buscar reserva…" />
        <button class="ghost" id="r_btnBuscar">Buscar</button>
        <button class="ghost" id="r_btnRefrescar">Refrescar</button>
      </div>
      <table>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Propiedad</th><th>Fecha</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody id="r_tbody"></tbody>
      </table>
    </div>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    async function api(path, opts = {}) {
      const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error de red"); return data;
    }

    // ---- CLIENTES ----
    async function c_cargar(q = "") {
      const data = await api(`/api/clientes?q=${encodeURIComponent(q)}&limit=1000`);
      const tbody = $("c_tbody"); tbody.innerHTML = "";
      data.data.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.dni}</td><td>${c.nombre}</td><td>${c.apellido || ""}</td>
          <td>${c.telefono || ""}</td><td>${c.email || ""}</td>
          <td class="row-actions"><button data-dni="${c.dni}" class="ghost c_btnDel">Eliminar</button></td>`;
        tbody.appendChild(tr);
      });
      document.querySelectorAll(".c_btnDel").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("¿Eliminar cliente " + btn.dataset.dni + "?")) return;
          try { await api(`/api/clientes/${btn.dataset.dni}`, { method: "DELETE" }); await c_cargar($("c_q").value.trim()); await r_fillOpts(); }
          catch (e) { alert(e.message); }
        };
      });
    }
    $("formCliente").onsubmit = async (e) => {
      e.preventDefault(); $("c_msg").textContent = "";
      const body = { dni: $("c_dni").value.trim(), nombre: $("c_nombre").value.trim(),
        apellido: $("c_apellido").value.trim(), telefono: $("c_telefono").value.trim(), email: $("c_email").value.trim() };
      if (!body.dni || !body.nombre) { $("c_msg").textContent = "dni y nombre son obligatorios"; return; }
      try { await api("/api/clientes", { method: "POST", body: JSON.stringify(body) }); e.target.reset(); await c_cargar(); $("c_msg").textContent = "✅ Cliente creado"; await r_fillOpts(); }
      catch (err) { $("c_msg").textContent = "❌ " + err.message; }
    };
    $("c_btnBuscar").onclick = () => c_cargar($("c_q").value.trim());
    $("c_btnRefrescar").onclick = () => { $("c_q").value = ""; c_cargar(); };

    // ---- PROPIEDADES ----
    async function p_cargar(q = "") {
      const data = await api(`/api/propiedades?q=${encodeURIComponent(q)}&limit=1000`);
      const tbody = $("p_tbody"); tbody.innerHTML = "";
      data.data.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td><td>${p.tipo}</td><td>${p.direccion}</td><td>${p.localidad || ""}</td>
          <td>${p.ambientes ?? ""}</td><td>${p.precioUSD ?? ""}</td>
          <td class="row-actions"><button data-id="${p.id}" class="ghost p_btnDel">Eliminar</button></td>`;
        tbody.appendChild(tr);
      });
      document.querySelectorAll(".p_btnDel").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("¿Eliminar propiedad " + btn.dataset.id + "?")) return;
          try { await api(`/api/propiedades/${btn.dataset.id}`, { method: "DELETE" }); await p_cargar($("p_q").value.trim()); await r_fillOpts(); }
          catch (e) { alert(e.message); }
        };
      });
    }
    $("formProp").onsubmit = async (e) => {
      e.preventDefault(); $("p_msg").textContent = "";
      const body = {
        id: $("p_id").value.trim(), tipo: $("p_tipo").value.trim(), direccion: $("p_direccion").value.trim(),
        localidad: $("p_localidad").value.trim(), ambientes: Number($("p_ambientes").value), precioUSD: Number($("p_precio").value)
      };
      if (!body.id || !body.tipo || !body.direccion) { $("p_msg").textContent = "id, tipo y direccion son obligatorios"; return; }
      try { await api("/api/propiedades", { method: "POST", body: JSON.stringify(body) }); e.target.reset(); await p_cargar(); $("p_msg").textContent = "✅ Propiedad creada"; await r_fillOpts(); }
      catch (err) { $("p_msg").textContent = "❌ " + err.message; }
    };
    $("p_btnBuscar").onclick = () => p_cargar($("p_q").value.trim());
    $("p_btnRefrescar").onclick = () => { $("p_q").value = ""; p_cargar(); };

    // ---- RESERVAS ----
    function setToday() {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      $("r_fecha").value = `${yyyy}-${mm}-${dd}`;
    }

    async function r_fillOpts() {
      $("r_msg").textContent = "Cargando opciones...";
      $("r_btnSubmit").disabled = true;

      const cs = await api(`/api/clientes?limit=1000`);
      const ps = await api(`/api/propiedades?limit=1000`);

      const sCli = $("r_dni");
      const sProp = $("r_prop");

      sCli.innerHTML = `<option value="" selected disabled>— seleccionar cliente —</option>`;
      sProp.innerHTML = `<option value="" selected disabled>— seleccionar propiedad —</option>`;

      cs.data.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.dni;
        opt.textContent = `${c.dni} — ${c.nombre} ${c.apellido || ""}`;
        sCli.appendChild(opt);
      });

      ps.data.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.id} — ${p.tipo} — ${p.direccion}`;
        sProp.appendChild(opt);
      });

      setToday();
      $("r_btnSubmit").disabled = !(cs.data.length && ps.data.length);
      $("r_msg").textContent = cs.data.length && ps.data.length
        ? ""
        : "⚠️ Necesitás al menos 1 cliente y 1 propiedad para crear una reserva.";
    }

    async function r_cargar(q = "") {
      const data = await api(`/api/reservas?q=${encodeURIComponent(q)}&limit=1000`);
      const tbody = $("r_tbody"); tbody.innerHTML = "";
      data.data.forEach(r => {
        const tr = document.createElement("tr");
        const cliTxt = r._cliente ? `${r._cliente.dni} — ${r._cliente.nombre} ${r._cliente.apellido || ""}` : r.dniCliente;
        const propTxt = r._propiedad ? `${r._propiedad.id} — ${r._propiedad.tipo} — ${r._propiedad.direccion}` : r.idPropiedad;
        tr.innerHTML = `
          <td>${r.id}</td><td>${cliTxt}</td><td>${propTxt}</td>
          <td>${r.fecha}</td><td>${r.monto}</td><td>${r.estado}</td>
          <td class="row-actions"><button data-id="${r.id}" class="ghost r_btnDel">Eliminar</button></td>`;
        tbody.appendChild(tr);
      });
      document.querySelectorAll(".r_btnDel").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("¿Eliminar reserva " + btn.dataset.id + "?")) return;
          try { await api(`/api/reservas/${btn.dataset.id}`, { method: "DELETE" }); await r_cargar($("r_q").value.trim()); }
          catch (e) { alert(e.message); }
        };
      });
    }

    $("formRes").onsubmit = async (e) => {
      e.preventDefault(); $("r_msg").textContent = "";

      const id = $("r_id").value.trim();
      const dniCliente = $("r_dni").value;
      const idPropiedad = $("r_prop").value;
      const fecha = $("r_fecha").value;

      if (!id || !dniCliente || !idPropiedad || !fecha) {
        $("r_msg").textContent = "❌ id, dniCliente, idPropiedad y fecha son obligatorios";
        return;
      }

      const body = {
        id,
        dniCliente,
        idPropiedad,
        fecha,
        monto: Number($("r_monto").value) || 0,
        estado: $("r_estado").value
      };

      try {
        await api("/api/reservas", { method: "POST", body: JSON.stringify(body) });
        e.target.reset();
        setToday();
        await r_cargar();
        $("r_msg").textContent = "✅ Reserva creada";
      } catch (err) {
        $("r_msg").textContent = "❌ " + err.message;
      }
    };
    $("r_btnBuscar").onclick = () => r_cargar($("r_q").value.trim());
    $("r_btnRefrescar").onclick = () => { $("r_q").value = ""; r_cargar(); };

    $("btnPing").onclick = async () => { try { $("pingOut").textContent = JSON.stringify(await api("/api/ping")); } catch (e) { $("pingOut").textContent = e.message; } };

    c_cargar(); p_cargar(); r_fillOpts(); r_cargar();
  </script>
</body>
</html>
