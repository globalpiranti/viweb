import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { WSContext } from "hono/ws";

declare global {
  var wsConnected: Map<string, WSContext<unknown>>;
}

globalThis.wsConnected ??= new Map();

function ws() {
  const { upgradeWebSocket, websocket } = createBunWebSocket();
  const app = new Hono();
  app.get(
    "/",
    upgradeWebSocket((c) => ({
      onOpen: (_, ws) => {
        const id = Bun.randomUUIDv7();
        c.set("wsId", id);
        globalThis.wsConnected.set(id, ws);
      },
      onClose: () => {
        globalThis.wsConnected.delete(c.var.wsId);
      },
    })),
  );

  return {
    app,
    websocket,
    reload: () => {
      globalThis.wsConnected.forEach((ws) => ws.send("reload"));
    },
  };
}

export default ws();
