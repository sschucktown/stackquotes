const modulePromise = import("../apps/api/dist/index.js");

const getHandler = async () => {
  const mod = await modulePromise;
  const handler = mod.default;
  if (typeof handler !== "function") {
    throw new Error("API module default export must be a function");
  }
  return { handler, mod };
};

const createHeaders = (nodeHeaders) => {
  const headers = new Headers();
  for (const key of Object.keys(nodeHeaders)) {
    const value = nodeHeaders[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          headers.append(key, item);
        }
      }
    } else if (typeof value === "string") {
      headers.append(key, value);
    }
  }
  return headers;
};

const toFetchRequest = async (req) => {
  const url = new URL(req.url ?? "/", `https://${req.headers.host ?? "localhost"}`);
  const headers = createHeaders(req.headers);
  const init = {
    method: req.method,
    headers,
  };

  if (req.method && !["GET", "HEAD"].includes(req.method.toUpperCase())) {
    const chunks = [];
    for await (const chunk of req) {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk));
      }
    }
    const bodyBuffer = chunks.length ? Buffer.concat(chunks) : Buffer.alloc(0);
    headers.set("content-length", String(bodyBuffer.byteLength));
    init.body = bodyBuffer;
  }

  return new Request(url.toString(), init);
};

module.exports = async function handler(req, res) {
  const { handler } = await getHandler();
  if (handler.length > 1) {
    return handler(req, res);
  }
  const request = await toFetchRequest(req);
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
