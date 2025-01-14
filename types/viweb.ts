import type { AxiosInstance } from "axios";
import type { RequestHeader } from "hono/utils/headers";
import type { StatusCode } from "hono/utils/http-status";
import type moment from "moment";

export type ViwebConfig = {
  routes: Route[];
  globals?: { name: string; value: any }[];
};

export type Route = {
  handler?: Handler;
  path: string;
  children?: Route[];
};

export type Handler = (ctx: Context) => Promise<string> | string;

export type Context = {
  status: (status: StatusCode) => void;
  url: string;
  params: Record<string, string>;
  header: (key: RequestHeader) => string | undefined;
  setHeader: (key: string, value: string) => void;
  render: (path: string, data?: Record<string, any>) => Promise<string>;
  lib: {
    client: AxiosInstance;
    moment: typeof moment;
  };
};
