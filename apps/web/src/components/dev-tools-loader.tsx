"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { useEffect } from "react";
import { scan } from "react-scan";
import type {} from "@/types/window"; // Import Window interface extension

/**
 * Loads development tools only in web browser context (not in Capacitor WebView).
 * This prevents script errors that occur when dev tools try to interact with
 * browser extension APIs that don't exist in native WebViews.
 */
export function DevToolsLoader() {
  useEffect(() => {
    // Skip loading in Capacitor WebView (useEffect only runs on client where window exists)
    if (window.Capacitor) {
      return;
    }

    // Enable react-scan for detecting unnecessary re-renders
    // https://github.com/aidenybai/react-scan
    scan({ enabled: true });

    // Load react-grab for component inspection
    const reactGrab = document.createElement("script");
    reactGrab.src = "//unpkg.com/react-grab/dist/index.global.js";
    document.head.appendChild(reactGrab);

    // Load react-grab claude-code integration
    const claudeCode = document.createElement("script");
    claudeCode.src = "//unpkg.com/@react-grab/claude-code/dist/client.global.js";
    document.head.appendChild(claudeCode);

    // Load tweakcn CSS preview
    const tweakcn = document.createElement("script");
    tweakcn.src = "https://tweakcn.com/live-preview.min.js";
    tweakcn.async = true;
    tweakcn.crossOrigin = "anonymous";
    document.head.appendChild(tweakcn);

    return () => {
      // Cleanup on unmount (unlikely but good practice)
      reactGrab.remove();
      claudeCode.remove();
      tweakcn.remove();
    };
  }, []);

  return null;
}
