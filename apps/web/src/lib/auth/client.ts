import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { oneTapClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// biome-ignore lint/style/noProcessEnv: Client-side env var needed at module initialization
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Warn developers if Google OAuth is not configured (dev only)
// biome-ignore lint/style/noProcessEnv: Required for environment check
if (process.env.NODE_ENV === "development" && !googleClientId) {
  console.warn(
    "[Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set. Google sign-in and One Tap will be disabled.",
  );
}

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    ...(googleClientId
      ? [
          oneTapClient({
            clientId: googleClientId,
            autoSelect: false,
            cancelOnTapOutside: true,
            context: "signin",
          }),
        ]
      : []),
  ],
});
