// Reconvierte archivos con "mojibake" (Ã, Â, etc.) a UTF-8 real.
// Uso: node tools/fix-encoding.js D:\Inmovia\apps\web\src

const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || ".";
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json"]);

function listFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...listFiles(full));
    } else if (exts.has(path.extname(full).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function looksMojibake(str) {
  // Patrones típicos de UTF-8 leído como Latin-1 y luego guardado:
  return /[ÃÂ][\x80-\xBF]|Ã¯Â|Â¿|Â¡/.test(str);
}

function fixString(str) {
  // Toma el string "roto" (ya con Ã¡, Â¿, etc.), lo interpreta como latin1 y lo decodifica a utf8 real.
  const buf = Buffer.from(str, "latin1");
  return buf.toString("utf8");
}

const files = listFiles(ROOT);
let fixed = 0, scanned = 0;

for (const f of files) {
  const raw = fs.readFileSync(f);               // bytes tal cual
  let s = raw.toString("utf8");                 // así es como lo ve Node ahora
  scanned++;
  if (looksMojibake(s)) {
    const repaired = fixString(s);
    // Si la reparación aún contiene mojibake, no tocar.
    if (looksMojibake(repaired)) {
      console.log(`⚠️  No seguro arreglar: ${f}`);
      continue;
    }
    fs.writeFileSync(f, Buffer.from(repaired, "utf8")); // guarda en UTF-8 sin BOM
    fixed++;
    console.log(`✅ Arreglado: ${f}`);
  }
}

console.log(`\nListo. Revisados: ${scanned} archivos. Corregidos: ${fixed}.`);
