import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const port = process.env.PORT || 4173;
const root = new URL("../../", import.meta.url);

const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json"
};

const server = createServer(async (req, res) => {
  const urlPath = req.url === "/" ? "/examples/core/index.html" : req.url;
  const filePath = new URL(`.${urlPath}`, root);
  try {
    const data = await readFile(filePath);
    const ext = extname(urlPath || "");
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream"
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Core example running on http://localhost:${port}`);
});
