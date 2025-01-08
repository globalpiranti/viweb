import { Edge } from "edge.js";
import { resolve } from "node:path";

function edge() {
  const edge = Edge.create();
  edge.mount(resolve("src", "edges"));

  return (path: string, data?: Record<string, any>) => edge.render(path, data);
}

export default edge();
