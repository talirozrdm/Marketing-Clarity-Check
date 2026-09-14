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
  assert.match(html, /בדקי מה מעכב אותך/);
  assert.match(html, /כ־4 דקות/);
  assert.doesNotMatch(html, /—/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
  const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /hero-actions/);
  assert.match(source, /https:\/\/tali-digicard\.vercel\.app\//);
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

test("result page follows the fixed diagnostic hierarchy", () => {
  const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const orderedSections = ["result-hero-card", "insights-section", "impact-section", "action-map", "not-now-section", "result-cta"];
  const positions = orderedSections.map(section => source.indexOf(`className="${section}`));
  assert.ok(positions.every(position => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.doesNotMatch(source, /summary-box|focus-box|action-pair|tali-note|diagnosis-section/);
});
