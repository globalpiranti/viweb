import type { RequestHeader } from "hono/utils/headers";

export type ViwebConfig = {
  routes: Route[];
};

export type Route = {
  handler?: Handler;
  path: string;
  children?: Route[];
};

export type Handler = (ctx: Context) => Promise<string> | string;

export type Context = {
  params: Record<string, string>;
  header: (key: RequestHeader) => string | undefined;
  setHeader: (key: string, value: string) => void;
  render: (path: string, data?: Record<string, any>) => Promise<string>;
};
