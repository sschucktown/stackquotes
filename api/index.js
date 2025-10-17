const { Readable } = require("node:stream");
const modulePromise = import("../apps/api/dist/index.js");

const getHandler = async () => {
  const mod = await modulePromise;
  const handler = mod.default;
  if (typeof handler !== "function") {
    throw new Error("API module default export must be a function");
  }
  return { handler, mod };
};

const toFetchRequest = (req) => {
  const url = new URL(req.url ?? "/", `https://${req.headers.host ?? "localhost"}`);
  const init = {
    method: req.method,
    headers: req.headers,
  };
  if (req.method && !["GET", "HEAD"].includes(req.method.toUpperCase())) {
    if (typeof Readable.toWeb === "function") {
      init.body = Readable.toWeb(req);
    } else {
      init.body = req;
    }
    init.duplex = "half";
  }
  return new Request(url.toString(), init);
};

module.exports = async function handler(req, res) {
  const { handler } = await getHandler();
  if (handler.length > 1) {
    return handler(req, res);
  }
  const request = toFetchRequest(req);
  const response = await handler(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const reader = response.body.getReader();
  const pump = () =>
    reader.read().then(({ done, value }) => {
      if (done) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
      return pump();
    });

  return pump();
};

modulePromise
  .then((mod) => {
    module.exports.config = mod.config ?? { runtime: "@vercel/node@5.4.0" };
  })
  .catch((error) => {
    console.error("[api] failed to preload module", error);
    module.exports.config = { runtime: "@vercel/node@5.4.0" };
  });
