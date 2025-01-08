import { Hono } from "hono";
import router from "./utils/router";
import viwebConfig from "./viweb.config";
import edge from "./utils/edge";
import script from "./utils/script";
import { serveStatic } from "hono/bun";

const server = new Hono();

server.use("/scripts/*", async (c, next) => {
  const code = await script("./src" + c.req.path);

  if (!code) return next();

  c.header("Content-Type", "text/javascript");
  return c.body(code);
});

server.use("*", serveStatic({ root: "./public" }));

server.get("*", async (c) => {
  const { handler, params = {} } = router(c.req.path, viwebConfig.routes) || {};

  if (handler) {
    c.header("Content-Type", "text/html");
    return c.body(
      await handler({
        params,
        render: edge,
        header: c.req.header,
        setHeader: c.header,
      }),
    );
  }

  return c.json({ error: "Not found" }, 404);
});

export default {
  port: 3000,
  fetch: server.fetch,
};
