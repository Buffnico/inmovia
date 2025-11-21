// apps/api/src/googleCalendar.js
// Integración con Google Calendar para Inmovia (Owner)

const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const router = express.Router();

// Scope completo de Calendar
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Tomamos las variables del .env (mismas en local y prod)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_AGENDA_URL =
  process.env.FRONTEND_AGENDA_URL ||
  "http://localhost:5173/#/agenda?google=connected";

// Chequeo básico de config
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  console.error(
    "⚠️ Falta configuración de Google OAuth. Revisá GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI en el .env de la API."
  );
}

// Cliente OAuth2 configurado con las variables de entorno
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Ruta de archivo para guardar tokens
const STORAGE_DIR =
  process.env.STORAGE_DIR || path.join(__dirname, "..", "storage");
const TOKENS_FILE = path.join(STORAGE_DIR, "googleTokens.json");

// ⚠️ MVP: tokens en memoria (solo Owner) + persistidos a disco
let savedTokens = null;

function loadTokensFromDisk() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, "utf8");
      if (raw) {
        savedTokens = JSON.parse(raw);
        oauth2Client.setCredentials(savedTokens);
        console.log("🔁 Tokens de Google cargados desde disco.");
      }
    } else {
      console.log("ℹ️ No hay archivo de tokens de Google aún.");
    }
  } catch (err) {
    console.error("❌ Error leyendo tokens de Google desde disco:", err);
  }
}

function saveTokensToDisk(tokens) {
  try {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens));
    console.log("💾 Tokens de Google guardados en", TOKENS_FILE);
  } catch (err) {
    console.error("❌ Error guardando tokens de Google en disco:", err);
  }
}

// Cargamos tokens al iniciar el módulo
loadTokensFromDisk();

// Helper: cliente de Calendar ya autenticado
function getCalendarClient() {
  if (!savedTokens) {
    const err = new Error("Google Calendar no está conectado.");
    err.status = 401;
    throw err;
  }
  oauth2Client.setCredentials(savedTokens);
  return google.calendar({ version: "v3", auth: oauth2Client });
}

// Helper: URL de autorización
function generateAuthUrl() {
  console.log("🔐 Generando auth URL con redirect_uri =", GOOGLE_REDIRECT_URI);
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

// Helper: formatear eventos para el front
function formatEvent(ev) {
  let date = "";
  let startTime = "";
  let endTime = "";

  if (ev.start) {
    if (ev.start.dateTime) {
      const start = new Date(ev.start.dateTime);
      date = start.toISOString().slice(0, 10);
      startTime = start.toTimeString().slice(0, 5);
    } else if (ev.start.date) {
      date = ev.start.date;
    }
  }

  if (ev.end) {
    if (ev.end.dateTime) {
      const end = new Date(ev.end.dateTime);
      if (!date) {
        date = end.toISOString().slice(0, 10);
      }
      endTime = end.toTimeString().slice(0, 5);
    }
  }

  const priv =
    ev.extendedProperties && ev.extendedProperties.private
      ? ev.extendedProperties.private
      : {};

  const type = priv.type || null;
  const agent = priv.agent || null;

  return {
    id: ev.id,
    summary: ev.summary,
    description: ev.description || "",
    date,
    startTime,
    endTime,
    type,
    agent,
  };
}

/**
 * GET /api/calendar/status
 */
router.get("/status", (req, res) => {
  const connected = !!savedTokens;
  console.log(
    "GET /api/calendar/status -> connected =",
    connected,
    "| tokens en memoria =",
    savedTokens ? "SÍ" : "NO"
  );
  res.json({
    connected,
    message: connected
      ? "Conectado a Google Calendar."
      : "La cuenta no está conectada. Conectá la cuenta del Owner desde Inmovia Office.",
  });
});

/**
 * GET /api/calendar/connect
 * Redirige al login de Google.
 */
router.get("/connect", (req, res) => {
  try {
    const url = generateAuthUrl();
    res.redirect(url);
  } catch (err) {
    console.error("Error en /connect:", err);
    res.status(500).send("No se pudo redirigir a Google.");
  }
});

/**
 * GET /api/calendar/oauth2callback
 * Google redirige acá con ?code=...
 */
router.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  console.log("⚡ /api/calendar/oauth2callback llamado. code =", code);

  if (!code) {
    return res.status(400).send("Falta el parámetro 'code'.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ Tokens recibidos de Google:", !!tokens);

    savedTokens = tokens;
    oauth2Client.setCredentials(tokens);
    saveTokensToDisk(tokens);

    const redirectUrl = FRONTEND_AGENDA_URL;
    console.log("➡️ Redirigiendo al front:", redirectUrl);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(
      "Error intercambiando código de Google:",
      err.response?.data || err
    );
    res.status(500).send("Error al conectar con Google Calendar.");
  }
});

/**
 * GET /api/calendar/events?days=7
 */
router.get("/events", async (req, res) => {
  try {
    const calendar = getCalendarClient();

    const days = Number(req.query.days || 7);
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + days);

    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: limit.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const events = (result.data.items || []).map(formatEvent);

    res.json({ events });
  } catch (err) {
    console.error("Error listando eventos:", err);
    res.status(err.status || 500).json({
      error: err.message || "No se pudieron obtener los eventos.",
    });
  }
});

/**
 * POST /api/calendar/events
 * Formato nuevo:
 *   { title, type, date, startTime, endTime, detail, agent }
 */
router.post("/events", async (req, res) => {
  try {
    const calendar = getCalendarClient();

    const {
      summary,
      description,
      startDateTime,
      endDateTime,
      title,
      type,
      date,
      startTime,
      endTime,
      detail,
      agent,
    } = req.body;

    const finalSummary = summary || title || "Evento Inmovia";

    let descriptionParts = [];
    if (type) descriptionParts.push(`Tipo: ${type}`);
    if (agent) descriptionParts.push(`Agente: ${agent}`);
    if (detail) descriptionParts.push(detail);

    const finalDescription =
      description ||
      (descriptionParts.length > 0
        ? descriptionParts.join(" | ")
        : "Evento creado desde Inmovia Office");

    let finalStart = startDateTime;
    let finalEnd = endDateTime;

    if (!finalStart || !finalEnd) {
      if (!date || !startTime || !endTime) {
        return res.status(400).json({
          error:
            "Faltan datos del evento. Requerido: summary/title y (startDateTime/endDateTime) o bien date + startTime + endTime.",
        });
      }
      finalStart = `${date}T${startTime}:00`;
      finalEnd = `${date}T${endTime}:00`;
    }

    const privateProps = {};
    if (type) privateProps.type = type;
    if (agent) privateProps.agent = agent;

    const event = {
      summary: finalSummary,
      description: finalDescription,
      start: {
        dateTime: finalStart,
        timeZone: "America/Argentina/Buenos_Aires",
      },
      end: {
        dateTime: finalEnd,
        timeZone: "America/Argentina/Buenos_Aires",
      },
      extendedProperties:
        Object.keys(privateProps).length > 0
          ? { private: privateProps }
          : undefined,
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    res.status(201).json(result.data);
  } catch (err) {
    console.error("Error creando evento:", err);
    res.status(err.status || 500).json({
      error: err.message || "No se pudo crear el evento.",
    });
  }
});

module.exports = router;
