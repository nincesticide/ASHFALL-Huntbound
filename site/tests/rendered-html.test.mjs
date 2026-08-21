import assert from "node:assert/strict";
import { lstat, readFile } from "node:fs/promises";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

function makeDatabase(results = []) {
  const batches = [];

  function statement(query, values = []) {
    return {
      query,
      values,
      bind(...nextValues) {
        return statement(query, nextValues);
      },
      async all() {
        return { results };
      },
    };
  }

  return {
    batches,
    prepare(query) {
      return statement(query);
    },
    async batch(statements) {
      batches.push(statements);
      return statements.map(() => ({ success: true, results: [] }));
    },
  };
}

function runtimeEnvironment(database = makeDatabase()) {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
    DB: database,
  };
}

test("renders the ASHFALL game shell and canonical game entry", async () => {
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    runtimeEnvironment(),
    executionContext,
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>ASHFALL — Huntbound v0\.14\.0<\/title>/);
  assert.match(html, /<main class="game-shell">/);
  assert.match(html, /<iframe class="game-frame"/);
  assert.match(html, /src="\/game\/index\.html"/);
  assert.match(html, /title="ASHFALL Huntbound v0\.14\.0 — Open World"/);

  const gameEntry = new URL("../public/game/index.html", import.meta.url);
  assert.ok((await lstat(gameEntry)).isFile());
  const gameHtml = await readFile(gameEntry, "utf8");
  assert.match(gameHtml, /<link rel="stylesheet" href="css\/game\.css">/);
  assert.match(gameHtml, /<script src="js\/game\.js"><\/script>/);
});

test("serves the bounded GET/POST multiplayer mailbox and rejects deletion", async () => {
  const database = makeDatabase();
  const environment = runtimeEnvironment(database);

  const getResponse = await worker.fetch(
    new Request("http://localhost/api/multiplayer?room=ABC234&since=0"),
    environment,
    executionContext,
  );
  assert.equal(getResponse.status, 200);
  assert.deepEqual(await getResponse.json(), { events: [], cursor: 0 });

  const postResponse = await worker.fetch(
    new Request("http://localhost/api/multiplayer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        room: "ABC234",
        event: { type: "test", _senderPeerId: "fixture-peer" },
      }),
    }),
    environment,
    executionContext,
  );
  assert.equal(postResponse.status, 201);
  assert.deepEqual(await postResponse.json(), { ok: true });
  assert.equal(database.batches.length, 1);
  assert.match(database.batches[0][0].query, /^INSERT INTO multiplayer_events/);

  const deleteResponse = await worker.fetch(
    new Request("http://localhost/api/multiplayer?room=ABC234", { method: "DELETE" }),
    environment,
    executionContext,
  );
  assert.equal(deleteResponse.status, 405);
  assert.equal(deleteResponse.headers.get("allow"), "GET, POST");
});
