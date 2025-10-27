import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDataPath(file = "clientes.json") {
  return path.resolve(__dirname, "..", "data", file);
}

async function ensureFile(file = "clientes.json") {
  const dataPath = resolveDataPath(file);
  try {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, "[]", "utf8");
  }
}

export async function readJSON(file = "clientes.json") {
  const dataPath = resolveDataPath(file);
  await ensureFile(file);
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw || "[]");
}

export async function writeJSON(data, file = "clientes.json") {
  const dataPath = resolveDataPath(file);
  await ensureFile(file);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(dataPath, json, "utf8");
}

// Reutilizable para búsquedas simples
export function matchCliente(cli, q = "") {
  if (!q) return true;
  const hay = (s) => String(s || "").toLowerCase().includes(q.toLowerCase());
  return (
    hay(cli.dni) ||
    hay(cli.nombre) ||
    hay(cli.apellido) ||
    hay(cli.email) ||
    hay(cli.telefono)
  );
}
