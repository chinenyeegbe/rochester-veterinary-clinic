const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 5173;
const rootDir = __dirname;

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"]
]);

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, {
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function safeResolveUrlPath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  // URL paths start with "/"; strip it so path.join doesn't treat it as absolute.
  const withoutLeadingSlash = decoded.replace(/^\/+/, "");
  const normalized = path.normalize(withoutLeadingSlash).replace(/^(\.\.[/\\])+/, "");
  const resolved = path.join(rootDir, normalized);
  if (!resolved.startsWith(rootDir)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname || "/";

  let filePath;
  if (pathname === "/") {
    filePath = path.join(rootDir, "index.html");
  } else {
    filePath = safeResolveUrlPath(pathname);
  }

  if (!filePath) {
    send(res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad Request");
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes.get(ext) || "application/octet-stream";

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        send(
          res,
          500,
          { "Content-Type": "text/plain; charset=utf-8" },
          "Internal Server Error"
        );
        return;
      }

      send(res, 200, { "Content-Type": contentType }, data);
    });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Dev server running at http://127.0.0.1:${port}`);
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
