/**
 * File and Blob utilities
 * Shared utilities for working with files and blobs
 */

/**
 * Convert a Blob to a data URL using FileReader
 *
 * @param blob - The blob to convert
 * @returns Promise resolving to the data URL string
 * @throws Error if FileReader fails
 *
 * @example
 * ```typescript
 * const blob = new Blob(["Hello"], { type: "text/plain" });
 * const dataUrl = await blobToDataUrl(blob);
 * // dataUrl: "data:text/plain;base64,SGVsbG8="
 * ```
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("loadend", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read blob as data URL - result is not a string"));
      }
    });

    reader.addEventListener("error", (error) => {
      const errorMessage =
        error instanceof ErrorEvent ? `${error.message}` : "Unknown error reading blob";
      reject(new Error(`FileReader error: ${errorMessage}`));
    });

    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a File to a data URL using FileReader
 *
 * @param file - The file to convert
 * @returns Promise resolving to the data URL string
 * @throws Error if FileReader fails
 *
 * @example
 * ```typescript
 * const file = new File(["content"], "file.txt");
 * const dataUrl = await fileToDataUrl(file);
 * ```
 */
export function fileToDataUrl(file: File): Promise<string> {
  return blobToDataUrl(file);
}

/**
 * Fetch an image from a URL and convert to data URL
 *
 * Used to pre-fetch images for Web Workers which can't resolve relative paths.
 * Caches the result to avoid repeated fetches for the same URL.
 *
 * @param url - Image URL (can be relative or absolute)
 * @returns Promise resolving to base64 data URL
 * @throws Error if fetch or conversion fails
 *
 * @example
 * ```typescript
 * const dataUrl = await fetchImageAsDataUrl("/assets/logo.png");
 * // Pass dataUrl to Worker instead of relative path
 * ```
 */
const imageCache = new Map<string, string>();

export async function fetchImageAsDataUrl(url: string): Promise<string> {
  // Check cache first
  const cached = imageCache.get(url);
  if (cached) {
    return cached;
  }

  // Fetch the image
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  // Convert to data URL
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);

  // Cache for future use
  imageCache.set(url, dataUrl);

  return dataUrl;
}
