const maxApi = require("max-api");
const http = require("http");

const statusUrl = "http://127.0.0.1:3030/status";

maxApi.post("StemDrop debug JS loaded");

maxApi.addHandler("status", () => {
  maxApi.post("status requested");

  const request = http.get(statusUrl, (response) => {
    const chunks = [];

    response.on("data", (chunk) => chunks.push(chunk));
    response.on("end", () => {
      const body = Buffer.concat(chunks).toString("utf8");
      maxApi.post(`status response received: HTTP ${response.statusCode}`);
      maxApi.post(body);
    });
  });

  request.on("error", (error) => {
    maxApi.post("status request failed");
    maxApi.post(error.stack || error.message || String(error));
  });
});
