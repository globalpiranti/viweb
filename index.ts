import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import client from "./utils/client";
import edge from "./utils/edge";
import router from "./utils/router";
import script from "./utils/script";
import watchEdge from "./utils/watch";
import ws from "./utils/ws";
import viwebConfig from "./viweb.config";

const server = new Hono();
const { app, websocket } = ws;

server.use("/scripts/*", async (c, next) => {
  const code = await script("./src" + c.req.path);

  if (!code) return next();

  c.header("Content-Type", "text/javascript");
  return c.body(code);
});

server.route("/ws", app);

server.get("/@hmr", async (c) => {
  const code = await script("./utils/hmr.js");

  c.header("Content-Type", "text/javascript");
  return c.body(code || "");
});

server.use("*", serveStatic({ root: "./public" }));

server.get("*", async (c) => {
  const { handler, params = {} } = router(c.req.path, viwebConfig.routes) || {};

  if (handler) {
    const body = await handler({
      status: c.status,
      params,
      url: c.req.url,
      render: async (...params) => {
        const scriptTag = `<script src="/@hmr" defer></script>`;
        c.header("Content-Type", "text/html");
        return (await edge(...params)).replace(
          /<head>([\s\S]*?)<\/head>/,
          (_match, content) => {
            return `<head>\n${scriptTag}\n${content}</head>`;
          },
        );
      },
      header: c.req.header,
      setHeader: c.header,
      lib: {
        client,
      },
    });

    return c.body(body);
  }

  return c.json({ error: "Not found" }, 404);
});

watchEdge();
ws.reload();

export default {
  port: 3000,
  fetch: server.fetch,
  websocket,
};
