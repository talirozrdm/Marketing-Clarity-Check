import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the branded diagnostic", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /מה באמת מעכב את/);
  assert.match(html, /שיווק דיגיטלי/);
  assert.match(html, /tali-digicard\.vercel\.app/);
  assert.match(html, /גלי מה מעכב אותך/);
  assert.match(html, /סריקה.*זיהוי.*מיקוד.*פעולה/);
  assert.doesNotMatch(html, /—/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("user-facing Hebrew strings contain no internal English or em dash", () => {
  const sources = ["../app/page.tsx", "../app/layout.tsx"]
    .map(path => fs.readFileSync(new URL(path, import.meta.url), "utf8"))
    .join("\n");
  const literals = sources.match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g) ?? [];
  const hebrewStrings = literals.map(text => text.slice(1, -1)).filter(text => /[א-ת]/.test(text));
  const forbidden = /—|\b(?:Direction|Capacity|Audience|Offer|Message|Content|Conversion|Reach|Primary|Secondary|Scoring)\b|Rule Engine|Follow-up/i;
  assert.deepEqual(hebrewStrings.filter(text => forbidden.test(text)), []);
});
