import { assertMethod, callNomi, getNomiKey, handleError, sendJson } from "../lib/nomi.js";

export default async function nomis(request, response) {
  if (!assertMethod(request, response, "GET")) return;
  try {
    const apiKey = getNomiKey(request);
    sendJson(response, 200, await callNomi("/nomis", apiKey));
  } catch (error) {
    handleError(error, response, "list-nomis");
  }
}
