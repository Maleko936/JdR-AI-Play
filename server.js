const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Erreur serveur");
      return;
    }
    const ext = path.extname(filePath);
    const type = mimeTypes[ext] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent(request.url.split("?")[0]);
  const safePath = path.normalize(urlPath).replace(/^\.\.(\/|\\)/, "");
  const resolvedPath = path.join(ROOT, safePath);

  if (safePath === "/" || safePath === "") {
    sendFile(response, path.join(ROOT, "index.html"));
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(response, resolvedPath);
      return;
    }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
