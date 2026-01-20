/**
 * Window interface extensions for development tools and optional globals.
 */
declare global {
  type Window = {
    /**
     * Capacitor object present when running in native WebView.
     * Used to detect mobile app context and skip browser-only dev tools.
     */
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  };
}

export {};
