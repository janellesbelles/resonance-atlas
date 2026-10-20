import { assertMethod, isConfigured, sendJson } from "../lib/nomi.js";

export default function health(request, response) {
  if (!assertMethod(request, response, "GET")) return;
  sendJson(response, 200, {
    ok: true,
    configured: isConfigured(),
  });
}
