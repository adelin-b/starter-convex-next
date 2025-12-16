import { z } from "zod";

/**
 * Validation schemas for common form fields.
 * Error messages are automatically localized via Zod's built-in locale system
 * configured in IntlProvider (z.config with zod/locales).
 */

export const emailSchema = z.email();

export const passwordSchema = z.string().min(8);

export const nameSchema = z.string().min(2);

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
