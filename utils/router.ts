import type { Handler, Route } from "../types/viweb";
import { match } from "path-to-regexp";

export default function router(
  search: string,
  routes: Route[],
  prefix: string = "/"
): { handler: Handler; params: Record<string, string> } | undefined {
  let found: { handler: Handler; params: Record<string, string> } | undefined =
    undefined;

  for (const route of routes) {
    if (route.children) {
      const check = router(
        search,
        route.children,
        `${prefix}${route.path ? route.path + "/" : ""}`
      );

      if (check) {
        found = check;
        break;
      }
    }

    if (route.handler) {
      const fn = match(prefix + route.path);
      const check = fn(search);

      if (check) {
        found = {
          handler: route.handler,
          params: (check as { params: Record<string, string> }).params,
        };
        break;
      }
    }
  }

  return found;
}
