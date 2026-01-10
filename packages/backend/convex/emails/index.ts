"use node";

import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/render";
import {
  InvitationEmail,
  PasswordResetEmail,
  VerificationEmail,
  WelcomeEmail,
} from "@starter-saas/emails/templates";
import nodemailer from "nodemailer";
import { z } from "zod";
import { components } from "../_generated/api";
import type { ActionCtx as ActionContext } from "../_generated/server";
import { env } from "../env";
import { zodInternalAction } from "../lib/functions";

// Initialize Resend component - testMode prevents sending to real addresses in dev
const resend = new Resend(components.resend, {
  testMode: !env.RESEND_API_KEY,
});

// Production from address (requires starter-saas.fr domain to be verified in Resend)
const PROD_FROM_EMAIL = "Starter SaaS <noreply@starter-saas.fr>";

// Test from address (works without domain verification)
// See: https://resend.com/docs/dashboard/emails/send-test-emails
const TEST_FROM_EMAIL = "Starter SaaS <onboarding@resend.dev>";

/**
 * Get the from email address.
 * Uses test address if RESEND_TEST_MODE is set, otherwise uses production address.
 * Set RESEND_TEST_MODE=true in Convex env to test without domain verification.
 */
function getFromEmail(): string {
  return env.RESEND_TEST_MODE ? TEST_FROM_EMAIL : PROD_FROM_EMAIL;
}

/**
 * Check if we should use SMTP instead of Resend API.
 * Uses SMTP when RESEND_API_KEY is not set and USE_SMTP is true.
 */
function isSmtpMode(): boolean {
  return !env.RESEND_API_KEY && env.USE_SMTP;
}

/**
 * Send email via SMTP (for local development with smtp4dev).
 */
async function sendViaSmtp(options: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
  });

  await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  console.log(`[SMTP] Email sent to ${options.to}: ${options.subject}`);
}

/**
 * Send email using either Resend API or SMTP fallback.
 */
async function sendEmail(
  context: ActionContext,
  options: { from: string; to: string; subject: string; html: string },
): Promise<void> {
  await (isSmtpMode() ? sendViaSmtp(options) : resend.sendEmail(context, options));
}

/**
 * Send email verification link to user
 */
export const sendVerificationEmail = zodInternalAction({
  args: {
    to: z.string(),
    name: z.string(),
    url: z.string(),
  },
  async handler(context, args) {
    const html = await render(
      VerificationEmail({
        name: args.name,
        verificationUrl: args.url,
      }),
    );

    await sendEmail(context, {
      from: getFromEmail(),
      to: args.to,
      subject: "Verify your email address",
      html,
    });
  },
});

/**
 * Send password reset link to user
 */
export const sendPasswordResetEmail = zodInternalAction({
  args: {
    to: z.string(),
    name: z.string(),
    url: z.string(),
  },
  async handler(context, args) {
    const html = await render(
      PasswordResetEmail({
        name: args.name,
        resetUrl: args.url,
      }),
    );

    await sendEmail(context, {
      from: getFromEmail(),
      to: args.to,
      subject: "Reset your password",
      html,
    });
  },
});

/**
 * Send welcome email after successful registration
 */
export const sendWelcomeEmail = zodInternalAction({
  args: {
    to: z.string(),
    name: z.string(),
  },
  async handler(context, args) {
    const html = await render(
      WelcomeEmail({
        name: args.name,
      }),
    );

    await sendEmail(context, {
      from: getFromEmail(),
      to: args.to,
      subject: "Welcome to Starter SaaS!",
      html,
    });
  },
});

/**
 * Send organization invitation email
 */
export const sendInvitationEmail = zodInternalAction({
  args: {
    to: z.string(),
    inviterName: z.string(),
    organizationName: z.string(),
    invitationUrl: z.string(),
    roles: z.array(z.string()),
    expiresInDays: z.number(),
  },
  async handler(context, args) {
    const html = await render(
      InvitationEmail({
        inviterName: args.inviterName,
        organizationName: args.organizationName,
        invitationUrl: args.invitationUrl,
        roles: args.roles,
        expiresInDays: args.expiresInDays,
      }),
    );

    await sendEmail(context, {
      from: getFromEmail(),
      to: args.to,
      subject: `You've been invited to join ${args.organizationName}`,
      html,
    });
  },
});
