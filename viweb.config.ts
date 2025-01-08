import Welcome from "./src";
import type { ViwebConfig } from "./types/viweb";

export default {
  routes: [
    {
      path: "",
      handler: Welcome,
    },
  ],
} as ViwebConfig;
