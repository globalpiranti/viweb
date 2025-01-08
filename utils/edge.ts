import { Edge } from "edge.js";
import { resolve } from "node:path";
import viwebConfig from "../viweb.config";

function edge() {
  const edge = Edge.create();
  edge.mount(resolve("src", "edges"));

  for (const global of viwebConfig.globals || []) {
    edge.global(global.name, global.value);
  }

  return (path: string, data?: Record<string, any>) => edge.render(path, data);
}

export default edge();
