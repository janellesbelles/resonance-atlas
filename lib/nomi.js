const NOMI_API = "https://api.nomi.ai/v1";

export function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(body));
}

export function assertMethod(request, response, method) {
  if (request.method === method) return true;
  response.setHeader("Allow", method);
  sendJson(response, 405, { error: `Use ${method} for this endpoint.`, type: "MethodNotAllowed" });
  return false;
}

export function getNomiKey(request) {
  const header = request.headers["x-nomi-key"];
  const apiKey = String(Array.isArray(header) ? header[0] : header || "").trim();
  if (!apiKey || apiKey.length > 512) {
    throw Object.assign(new Error("Enter a valid Nomi account API key."), {
      status: 401,
      type: "InvalidNomiKey",
    });
  }
  return apiKey;
}

export function readBody(request) {
  const body = request.body ?? {};
  if (typeof body === "string") {
    if (body.length > 5000) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    try {
      return JSON.parse(body || "{}");
    } catch {
      throw Object.assign(new Error("Request body must be valid JSON."), { status: 400, type: "InvalidJson" });
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Request body must be a JSON object."), { status: 400, type: "InvalidJson" });
  }
  return body;
}

export async function callNomi(endpoint, apiKey, options = {}) {
  let response;
  try {
    response = await fetch(`${NOMI_API}${endpoint}`, {
      ...options,
      signal: AbortSignal.timeout(115000),
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw Object.assign(new Error("Nomi did not answer before the bridge timeout."), {
        status: 504,
        type: "NomiTimeout",
      });
    }
    throw Object.assign(new Error("The bridge could not reach Nomi."), {
      status: 502,
      type: "NomiUnavailable",
    });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const type = payload.error?.type || payload.type || `NomiHttp${response.status}`;
    throw Object.assign(new Error(type), {
      status: type === "NoReply" ? 504 : response.status,
      type,
    });
  }
  return payload;
}

export function handleError(error, response, context) {
  const status = Number(error.status) || 500;
  const type = error.type || (status >= 500 ? "BridgeError" : "InvalidRequest");
  console.error("Resonance Atlas API error", { context, status, type });
  sendJson(response, status, {
    error: error.message || "The private bridge failed.",
    type,
  });
}
