import { assertMethod, callNomi, handleError, requireAccess, sendJson } from "../lib/nomi.js";

export default async function nomis(request, response) {
  if (!assertMethod(request, response, "GET")) return;
  try {
    requireAccess(request);
    sendJson(response, 200, await callNomi("/nomis"));
  } catch (error) {
    handleError(error, response, "list-nomis");
  }
}
