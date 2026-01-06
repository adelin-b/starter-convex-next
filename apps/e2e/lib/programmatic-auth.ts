/**
 * Programmatic authentication utilities for E2E tests.
 *
 * Uses better-auth's HTTP API directly to create users and sessions
 * without going through the UI. This is much faster than UI-based auth.
 *
 * Use this for tests that need an authenticated user but are NOT testing auth itself.
 * For auth-specific tests, use the UI flow via auth.steps.ts.
 */

import type { Cookie } from "@playwright/test";

/** Credentials for test user creation/login */
export type TestCredentials = {
  email: string;
  name: string;
  password: string;
};

/** Result of programmatic sign-up */
export type SignUpResult = {
  success: boolean;
  cookies: Cookie[];
  error?: string;
};

/** Result of programmatic sign-in */
export type SignInResult = {
  success: boolean;
  cookies: Cookie[];
  error?: string;
};

/**
 * Apply a cookie attribute to the cookie object.
 */
function applyCookieAttribute(cookie: Cookie, key: string, value: string): void {
  switch (key.toLowerCase()) {
    case "path": {
      cookie.path = value;
      break;
    }
    case "domain": {
      cookie.domain = value;
      break;
    }
    case "expires": {
      cookie.expires = new Date(value).getTime() / 1000;
      break;
    }
    case "max-age": {
      cookie.expires = Date.now() / 1000 + Number.parseInt(value, 10);
      break;
    }
    case "httponly": {
      cookie.httpOnly = true;
      break;
    }
    case "secure": {
      cookie.secure = true;
      break;
    }
    case "samesite": {
      cookie.sameSite = value as "Strict" | "Lax" | "None";
      break;
    }
    default: {
      // Ignore unknown cookie attributes
      break;
    }
  }
}

/**
 * Parse a single Set-Cookie header into Playwright Cookie format.
 */
function parseSingleCookie(cookieString: string, url: URL): Cookie {
  const [nameValue, ...attributes] = cookieString.split(";").map((s) => s.trim());
  const [name, ...valueParts] = nameValue.split("=");
  const value = valueParts.join("="); // Handle values with = signs

  const cookie: Cookie = {
    name,
    value,
    domain: url.hostname,
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: url.protocol === "https:",
    sameSite: "Lax",
  };

  for (const attribute of attributes) {
    const [key, attributeValue] = attribute.split("=").map((s) => s.trim());
    applyCookieAttribute(cookie, key, attributeValue);
  }

  return cookie;
}

/**
 * Parse Set-Cookie headers into Playwright Cookie format.
 * Handles multiple Set-Cookie headers from better-auth.
 */
function parseSetCookieHeaders(headers: Headers, baseUrl: string): Cookie[] {
  const url = new URL(baseUrl);
  const setCookies = headers.getSetCookie?.() ?? [];
  return setCookies.map((cookieString) => parseSingleCookie(cookieString, url));
}

/**
 * Create a test user via better-auth's sign-up API.
 * Returns cookies that establish the authenticated session.
 *
 * @param baseUrl - Base URL of the web app (e.g., http://localhost:7001)
 * @param credentials - User credentials to create
 */
export async function signUpProgrammatic(
  baseUrl: string,
  credentials: TestCredentials,
): Promise<SignUpResult> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        name: credentials.name,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        cookies: [],
        error: `Sign-up failed (${response.status}): ${errorText}`,
      };
    }

    const cookies = parseSetCookieHeaders(response.headers, baseUrl);
    return { success: true, cookies };
  } catch (error) {
    return {
      success: false,
      cookies: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Sign in an existing user via better-auth's sign-in API.
 * Returns cookies that establish the authenticated session.
 *
 * @param baseUrl - Base URL of the web app (e.g., http://localhost:7001)
 * @param credentials - User credentials (email + password)
 */
export async function signInProgrammatic(
  baseUrl: string,
  credentials: Pick<TestCredentials, "email" | "password">,
): Promise<SignInResult> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        cookies: [],
        error: `Sign-in failed (${response.status}): ${errorText}`,
      };
    }

    const cookies = parseSetCookieHeaders(response.headers, baseUrl);
    return { success: true, cookies };
  } catch (error) {
    return {
      success: false,
      cookies: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create a test user and return authenticated cookies.
 * This is the main utility for tests that need auth.
 *
 * @param baseUrl - Base URL of the web app
 * @param testId - Unique test ID for generating unique email
 * @param workerIndex - Worker index for parallel execution
 */
export async function createAuthenticatedUser(
  baseUrl: string,
  testId: string,
  workerIndex: number,
): Promise<{ credentials: TestCredentials; cookies: Cookie[] }> {
  const credentials: TestCredentials = {
    email: `test+w${workerIndex}-${testId.slice(-8)}@example.com`,
    name: `Test User ${workerIndex}`,
    password: "SecureTestPass123!",
  };

  const result = await signUpProgrammatic(baseUrl, credentials);
  if (!result.success) {
    throw new Error(`Failed to create authenticated user: ${result.error}`);
  }

  return { credentials, cookies: result.cookies };
}
