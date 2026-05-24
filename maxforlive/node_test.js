const maxApi = require("max-api");

maxApi.post("NODE TEST LOADED");
maxApi.outlet("ready", 1);

maxApi.addHandler("ping", () => {
  maxApi.post("PING RECEIVED");
});
