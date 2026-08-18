import { cp, readdir, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const clientDirectory = new URL("dist/client/", root);
const outputDirectory = new URL("dist/", root);
const workerUrl = new URL("dist/server/index.js", root);
workerUrl.searchParams.set("static-export", Date.now().toString());

const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("http://localhost/", { headers: { accept: "text/html" } }),
  {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) {
  throw new Error(`Static page render failed with status ${response.status}`);
}

for (const entry of await readdir(clientDirectory)) {
  await cp(new URL(entry, clientDirectory), new URL(entry, outputDirectory), {
    recursive: true,
    force: true,
  });
}

await writeFile(
  new URL("index.html", outputDirectory),
  await response.text(),
  "utf8",
);
