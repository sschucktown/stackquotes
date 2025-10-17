const modulePromise = import("../apps/api/dist/index.js");

async function handler(req, res) {
  const mod = await modulePromise;
  const vercelHandler = mod.default;

  if (typeof vercelHandler !== "function") {
    throw new Error("API module did not export a default handler");
  }

  if (vercelHandler.length <= 1) {
    throw new Error("API module default export does not accept (req, res)");
  }

  return vercelHandler(req, res);
}

module.exports = handler;
module.exports.config = {
  runtime: "nodejs18.x",
};

modulePromise.then((mod) => {
  if (mod.config) {
    module.exports.config = mod.config;
  }
});
