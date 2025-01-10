import { watch } from "node:fs";
import ws from "./ws";

export default function watchEdge() {
  watch("./src/edges", (_ev, file) => {
    if (file?.endsWith(".edge")) {
      ws.reload();
    }
  });
}
