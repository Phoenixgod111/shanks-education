/**
 * Локальная раздача корня репозитория на :8000.
 * Слушает :: (dual-stack), чтобы работали и http://127.0.0.1:8000/, и http://localhost:8000/.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 8000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((req, res) => {
  try {
    const u = new URL(req.url || "/", "http://localhost");
    let p = decodeURIComponent(u.pathname);
    if (p === "/" || p === "") p = "/index.html";
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
      res.end(data);
    });
  } catch {
    res.writeHead(500).end("Error");
  }
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`Порт ${PORT} занят. Останови другой процесс или задай PORT=8080 npm run serve`);
  } else {
    console.error(e.message || e);
  }
  process.exit(1);
});

const onListen = () => {
  console.log(`Shanks static: http://127.0.0.1:${PORT}/  ·  http://localhost:${PORT}/`);
};

try {
  server.listen({ port: PORT, host: "::", ipv6Only: false }, onListen);
} catch {
  server.listen(PORT, "0.0.0.0", onListen);
}
