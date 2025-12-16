import { convexEnv } from "./env";

export default {
  providers: [
    {
      domain: convexEnv.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
