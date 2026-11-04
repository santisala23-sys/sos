// Cargado con NODE_OPTIONS=--require en el servidor Next de QA.
// Desvía los envíos Web Push a https://push.qa.local/* hacia el receptor local.
const http = require("node:http");
const https = require("node:https");

const PUSH_HOST = "push.qa.local";
const target = { hostname: "127.0.0.1", port: Number(process.env.QA_DB_PORT ?? 5499) };
const originalRequest = https.request;

https.request = function patchedRequest(options, callback) {
  const host = typeof options === "object" && options ? options.hostname || options.host : null;
  if (host && String(host).split(":")[0] === PUSH_HOST) {
    const { agent: _agent, ...rest } = options;
    return http.request({ ...rest, protocol: "http:", host: undefined, ...target }, callback);
  }
  return originalRequest.apply(this, arguments);
};
