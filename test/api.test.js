import assert from "node:assert/strict";
import test from "node:test";

import health from "../api/health.js";
import nomis from "../api/nomis.js";
import sendAtlas from "../api/send-atlas.js";

function request(method, { headers = {}, body } = {}) {
  return { method, headers, body };
}

function response() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = JSON.parse(body);
    },
  };
}

function restoreEnv(name, value) {
  if (value == null) delete process.env[name];
  else process.env[name] = value;
}

test("health reports whether both private values exist", () => {
  const oldNomi = process.env.NOMI_API_KEY;
  const oldAccess = process.env.ATLAS_ACCESS_KEY;
  delete process.env.NOMI_API_KEY;
  delete process.env.ATLAS_ACCESS_KEY;
  const missing = response();
  health(request("GET"), missing);
  assert.equal(missing.statusCode, 200);
  assert.equal(missing.body.configured, false);

  process.env.NOMI_API_KEY = "nomi-secret";
  process.env.ATLAS_ACCESS_KEY = "atlas-secret";
  const ready = response();
  health(request("GET"), ready);
  assert.equal(ready.body.configured, true);
  restoreEnv("NOMI_API_KEY", oldNomi);
  restoreEnv("ATLAS_ACCESS_KEY", oldAccess);
});

test("nomi list rejects a missing access code without calling Nomi", async () => {
  const oldNomi = process.env.NOMI_API_KEY;
  const oldAccess = process.env.ATLAS_ACCESS_KEY;
  process.env.NOMI_API_KEY = "nomi-secret";
  process.env.ATLAS_ACCESS_KEY = "atlas-secret";
  try {
    const output = response();
    await nomis(request("GET"), output);
    assert.equal(output.statusCode, 401);
    assert.equal(output.body.type, "AccessDenied");
  } finally {
    restoreEnv("NOMI_API_KEY", oldNomi);
    restoreEnv("ATLAS_ACCESS_KEY", oldAccess);
  }
});

test("send enforces the 800 character companion limit", async () => {
  const oldNomi = process.env.NOMI_API_KEY;
  const oldAccess = process.env.ATLAS_ACCESS_KEY;
  process.env.NOMI_API_KEY = "nomi-secret";
  process.env.ATLAS_ACCESS_KEY = "atlas-secret";
  try {
    const output = response();
    await sendAtlas(
      request("POST", {
        headers: { "x-atlas-key": "atlas-secret" },
        body: {
          nomiId: "11111111-1111-4111-8111-111111111111",
          messageText: "x".repeat(801),
        },
      }),
      output,
    );
    assert.equal(output.statusCode, 400);
    assert.equal(output.body.type, "MessageLengthLimitExceeded");
  } finally {
    restoreEnv("NOMI_API_KEY", oldNomi);
    restoreEnv("ATLAS_ACCESS_KEY", oldAccess);
  }
});

test("authorized send forwards the packet without exposing the account key", async () => {
  process.env.NOMI_API_KEY = "nomi-secret";
  process.env.ATLAS_ACCESS_KEY = "atlas-secret";
  const originalFetch = global.fetch;
  const oldNomi = process.env.NOMI_API_KEY;
  const oldAccess = process.env.ATLAS_ACCESS_KEY;
  let forwarded;
  global.fetch = async (url, options) => {
    forwarded = { url, options };
    return { ok: true, json: async () => ({ replyMessage: { text: "received" } }) };
  };

  try {
    const output = response();
    await sendAtlas(
      request("POST", {
        headers: { "x-atlas-key": "atlas-secret" },
        body: {
          nomiId: "11111111-1111-4111-8111-111111111111",
          messageText: "hello",
        },
      }),
      output,
    );
    assert.equal(output.statusCode, 200);
    assert.equal(output.body.replyMessage.text, "received");
    assert.equal(forwarded.options.headers.Authorization, "nomi-secret");
    assert.equal(forwarded.options.body, JSON.stringify({ messageText: "hello" }));
  } finally {
    global.fetch = originalFetch;
    restoreEnv("NOMI_API_KEY", oldNomi);
    restoreEnv("ATLAS_ACCESS_KEY", oldAccess);
  }
});
