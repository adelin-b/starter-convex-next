/**
 * Get local network IP address for mobile dev (Capacitor live reload)
 * Works across WiFi/Ethernet on macOS/Linux
 */
import { networkInterfaces } from "node:os";

/** Priority interfaces to check first (common names for WiFi/Ethernet) */
const PRIORITY_INTERFACES = ["en0", "en1", "eth0", "wlan0"] as const;

/**
 * Returns the local network IPv4 address, or null if not found.
 * Checks priority interfaces first, then falls back to any non-internal IPv4.
 */
export function getLocalIP(): string | null {
  const nets = networkInterfaces();

  // Check priority interfaces first
  for (const name of PRIORITY_INTERFACES) {
    const net = nets[name];
    if (net) {
      const ipv4 = net.find((n) => n.family === "IPv4" && !n.internal);
      if (ipv4) {
        return ipv4.address;
      }
    }
  }

  // Fallback: find any non-internal IPv4
  for (const name of Object.keys(nets)) {
    const net = nets[name];
    if (net) {
      const ipv4 = net.find((n) => n.family === "IPv4" && !n.internal);
      if (ipv4) {
        return ipv4.address;
      }
    }
  }

  return null;
}
