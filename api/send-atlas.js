import { assertMethod, callNomi, getNomiKey, handleError, readBody, sendJson } from "../lib/nomi.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function sendAtlas(request, response) {
  if (!assertMethod(request, response, "POST")) return;
  try {
    const apiKey = getNomiKey(request);
    const body = readBody(request);
    const nomiId = String(body.nomiId || "").trim();
    const messageText = String(body.messageText || "").trim();

    if (!UUID.test(nomiId)) {
      throw Object.assign(new Error("Choose a valid Nomi first."), { status: 400, type: "InvalidNomi" });
    }
    if (!messageText) {
      throw Object.assign(new Error("Generate an Atlas packet first."), { status: 400, type: "EmptyMessage" });
    }
    if (messageText.length > 800) {
      throw Object.assign(new Error("The Atlas packet must stay within 800 characters."), {
        status: 400,
        type: "MessageLengthLimitExceeded",
      });
    }

    sendJson(
      response,
      200,
      await callNomi(`/nomis/${encodeURIComponent(nomiId)}/chat`, apiKey, {
        method: "POST",
        body: JSON.stringify({ messageText }),
      }),
    );
  } catch (error) {
    handleError(error, response, "send-atlas");
  }
}
