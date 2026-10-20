import { assertMethod, sendJson } from "../lib/nomi.js";

export default function health(request, response) {
  if (!assertMethod(request, response, "GET")) return;
  sendJson(response, 200, {
    ok: true,
    mode: "bring-your-own-key",
  });
}
