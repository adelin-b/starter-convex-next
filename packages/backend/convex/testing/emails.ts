"use node";

import { type EmailId, Resend } from "@convex-dev/resend";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@starter-saas/emails/templates";
import { v } from "convex/values";
import nodemailer from "nodemailer";
import { components } from "../_generated/api";
import { action } from "../_generated/server";

// Initialize Resend in test mode (only allows test addresses like delivered@resend.dev)
const resend = new Resend(components.resend, {
  testMode: true,
});

const TEST_FROM_EMAIL = "Starter SaaS Test <test@starter-saas.fr>";

// SMTP config for local testing with smtp4dev
// biome-ignore lint/style/noProcessEnv: SMTP config only used in test mode
const SMTP_HOST = process.env.SMTP_HOST || "localhost";
// biome-ignore lint/style/noProcessEnv: SMTP config only used in test mode
const SMTP_PORT = Number(process.env.SMTP_PORT) || 2525;

/**
 * Check if we should use SMTP (local smtp4dev) instead of Resend API.
 * Uses SMTP when RESEND_API_KEY is not set but USE_SMTP=true.
 */
function isSmtpMode(): boolean {
  // biome-ignore lint/style/noProcessEnv: Environment check for email provider
  return !process.env.RESEND_API_KEY && process.env.USE_SMTP === "true";
}

/**
 * Send email via SMTP (for local testing with smtp4dev).
 */
async function sendViaSmtp(options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // smtp4dev doesn't use TLS
  });

  const info = await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  // Return message ID as the email ID
  return info.messageId;
}

/**
 * Send a test email for E2E testing.
 * Uses Resend API if RESEND_API_KEY is set, otherwise falls back to SMTP (smtp4dev).
 * Returns the email ID for status checking.
 *
 * Only works when IS_TEST=true (guarded for security)
 */
export const sendTestEmail = action({
  args: {
    label: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (context, args) => {
    // biome-ignore lint/style/noProcessEnv: Test mode guard for E2E testing
    if (process.env.IS_TEST !== "true") {
      throw new Error("Test email functions are only available in test mode (IS_TEST=true)");
    }

    // Determine email address based on mode (SMTP vs Resend)
    let toAddress: string;
    if (isSmtpMode()) {
      toAddress = args.label ? `test+${args.label}@localhost` : "test@localhost";
    } else {
      toAddress = args.label ? `delivered+${args.label}@resend.dev` : "delivered@resend.dev";
    }

    const html = await render(
      WelcomeEmail({
        name: "E2E Test User",
      }),
    );

    const emailOptions = {
      from: TEST_FROM_EMAIL,
      to: toAddress,
      subject: `E2E Test Email ${args.label || "default"}`,
      html,
    };

    if (isSmtpMode()) {
      // Send via SMTP to smtp4dev
      return await sendViaSmtp(emailOptions);
    }

    // Send via Resend API
    return await resend.sendEmail(context, emailOptions);
  },
});

/**
 * Check the status of a test email.
 * Returns status like "waiting", "queued", "sent", "delivered", etc.
 * For SMTP mode, always returns "delivered" since smtp4dev captures immediately.
 *
 * Only works when IS_TEST=true (guarded for security)
 */
export const getTestEmailStatus = action({
  args: {
    emailId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (context, args) => {
    // biome-ignore lint/style/noProcessEnv: Test mode guard for E2E testing
    if (process.env.IS_TEST !== "true") {
      throw new Error("Test email functions are only available in test mode (IS_TEST=true)");
    }

    // SMTP mode: smtp4dev captures immediately, so always "delivered"
    if (isSmtpMode()) {
      return "delivered";
    }

    // Resend API: check actual status
    const status = await resend.status(context, args.emailId as EmailId);
    return status as string | null;
  },
});
