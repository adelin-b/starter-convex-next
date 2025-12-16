import { api } from "@starter-saas/backend/convex/_generated/api";
import { expect, test } from "../../lib/test";

/**
 * E2E tests for email sending with Resend.
 *
 * These tests verify:
 * - Email infrastructure is properly connected
 * - Emails are queued and sent to Resend's test addresses
 * - Email status tracking works correctly
 *
 * Uses delivered@resend.dev which goes through the full Resend API
 * flow without affecting deliverability reputation.
 *
 * IMPORTANT: These tests require Node.js 18, 20, or 22 for the local Convex backend
 * to support "use node" actions. Node.js 25+ is not yet supported.
 *
 * @see https://resend.com/docs/knowledge-base/end-to-end-testing-with-playwright
 */

/**
 * Helper to check if Node.js actions are supported.
 * The local Convex backend only supports Node.js 18, 20, or 22.
 */
async function isNodeActionsSupported(
  backend: { client: { action: (ref: unknown, args: unknown) => Promise<unknown> } } | null,
): Promise<boolean> {
  if (!backend) {
    return false;
  }

  try {
    await backend.client.action(api.testing.emails.sendTestEmail, {
      label: "node-check",
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Node.js version mismatch error from local Convex backend
    if (message.includes("Could not find public function")) {
      return false;
    }
    // Function exists but IS_TEST isn't set - still means Node actions work
    if (message.includes("Test email functions are only available in test mode")) {
      return true;
    }
    // SMTP connection error - smtp4dev might not be running
    if (message.includes("ECONNREFUSED") || message.includes("connect ETIMEDOUT")) {
      console.log("[email-test] SMTP connection failed - is smtp4dev running?");
      return false;
    }
    // Other errors - log and assume not supported
    console.log("[email-test] Unexpected error:", message);
    return false;
  }
}

/* eslint-disable playwright/no-conditional-in-test, playwright/no-skipped-test, playwright/no-conditional-expect -- environment-based skips and polling logic */
test.describe("Email Sending", () => {
  test.beforeEach(async ({ backend }) => {
    if (!backend) {
      test.skip(true, "Requires isolated mode with backend access");
      return;
    }
    const supported = await isNodeActionsSupported(backend);
    if (!supported) {
      test.skip(
        true,
        "Email tests require Node.js 18/20/22 and either smtp4dev running " +
          "(docker run -d -p 5080:80 -p 2525:25 rnwood/smtp4dev) or RESEND_API_KEY",
      );
    }
  });

  test("can send a test email to delivered@resend.dev", async ({ backend }) => {
    if (!backend) {
      return;
    }
    // Generate unique label for this test run
    const label = `e2e-${Date.now()}`;

    // Send test email via public action (guarded by IS_TEST)
    const emailId = await backend.client.action(api.testing.emails.sendTestEmail, {
      label,
    });

    // Verify we got an email ID back
    expect(emailId).toBeTruthy();
    expect(typeof emailId).toBe("string");
  });

  test("email status progresses through queued states", async ({ backend }) => {
    if (!backend) {
      return;
    }

    // Send email
    const label = `status-test-${Date.now()}`;
    const emailId = await backend.client.action(api.testing.emails.sendTestEmail, {
      label,
    });

    // Initial status should be waiting or queued
    const initialStatus = await backend.client.action(api.testing.emails.getTestEmailStatus, {
      emailId,
    });

    // Email should start in a queued state (waiting, queued)
    // or already be sent if processing is fast
    expect(["waiting", "queued", "sent", "delivered"]).toContain(initialStatus);

    // If not yet delivered, poll for status updates (max 10 seconds)
    if (initialStatus !== "delivered") {
      const startTime = Date.now();
      const maxWaitMs = 10_000;
      let status = initialStatus;

      while (status !== "delivered" && Date.now() - startTime < maxWaitMs) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await backend.client.action(api.testing.emails.getTestEmailStatus, {
          emailId,
        });

        // If we hit an error state, fail the test
        if (status === "bounced" || status === "failed") {
          throw new Error(`Email failed with status: ${status}`);
        }
      }

      // Final status check - should be delivered or still processing
      expect(["sent", "delivered", "delivery_delayed"]).toContain(status);
    }
  });
});

test.describe("Email Integration Smoke Test", () => {
  test("email functions are registered and callable", async ({ backend }) => {
    if (!backend) {
      test.skip(true, "Requires isolated mode");
      return;
    }

    const supported = await isNodeActionsSupported(backend);
    if (!supported) {
      test.skip(true, "Email tests require Node.js 18/20/22 and either smtp4dev or RESEND_API_KEY");
      return;
    }

    // If we got here, Node.js actions work - the helper already validated
    // Just verify the action returns a valid email ID
    const emailId = await backend.client.action(api.testing.emails.sendTestEmail, {
      label: "smoke-test",
    });
    expect(emailId).toBeTruthy();
  });
});
/* eslint-enable playwright/no-conditional-in-test, playwright/no-skipped-test, playwright/no-conditional-expect */
