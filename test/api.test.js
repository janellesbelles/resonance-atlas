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

test("health advertises the per-visitor connection", () => {
  const output = response();
  health(request("GET"), output);
  assert.equal(output.statusCode, 200);
  assert.equal(output.body.ok, true);
  assert.equal(output.body.mode, "bring-your-own-key");
});

test("nomi list rejects a missing visitor key without calling Nomi", async () => {
  const output = response();
  await nomis(request("GET"), output);
  assert.equal(output.statusCode, 401);
  assert.equal(output.body.type, "InvalidNomiKey");
});

test("send enforces the 800 character companion limit", async () => {
  const output = response();
  await sendAtlas(
    request("POST", {
      headers: { "x-nomi-key": "visitor-secret" },
      body: {
        nomiId: "11111111-1111-4111-8111-111111111111",
        messageText: "x".repeat(801),
      },
    }),
    output,
  );
  assert.equal(output.statusCode, 400);
  assert.equal(output.body.type, "MessageLengthLimitExceeded");
});

test("send forwards only the current visitor's key to Nomi", async () => {
  const originalFetch = global.fetch;
  let forwarded;
  global.fetch = async (url, options) => {
    forwarded = { url, options };
    return { ok: true, json: async () => ({ replyMessage: { text: "received" } }) };
  };

  try {
    const output = response();
    await sendAtlas(
      request("POST", {
        headers: { "x-nomi-key": "visitor-secret" },
        body: {
          nomiId: "11111111-1111-4111-8111-111111111111",
          messageText: "hello",
        },
      }),
      output,
    );
    assert.equal(output.statusCode, 200);
    assert.equal(output.body.replyMessage.text, "received");
    assert.equal(forwarded.options.headers.Authorization, "visitor-secret");
    assert.equal(forwarded.options.body, JSON.stringify({ messageText: "hello" }));
  } finally {
    global.fetch = originalFetch;
  }
});
