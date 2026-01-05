import { zodResolver } from "@hookform/resolvers/zod";
import {
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

/**
 * Options for useZodForm, excluding resolver (enforced to use zodResolver)
 */
type UseZodFormOptions<TOutput extends FieldValues> = {
  defaultValues?: DefaultValues<TOutput>;
  mode?: "onBlur" | "onChange" | "onSubmit" | "onTouched" | "all";
  reValidateMode?: "onBlur" | "onChange" | "onSubmit";
  criteriaMode?: "firstError" | "all";
  shouldFocusError?: boolean;
  shouldUnregister?: boolean;
  shouldUseNativeValidation?: boolean;
  delayError?: number;
};

/**
 * A typed wrapper around react-hook-form's useForm that enforces Zod schema validation.
 *
 * This wrapper:
 * - Requires a Zod schema as the first argument
 * - Automatically configures zodResolver
 * - Provides full type inference from the schema
 * - Supports both ZodObject and ZodEffects (schemas with .refine() or .transform())
 *
 * @example
 * ```tsx
 * // Simple schema
 * const schema = z.object({
 *   email: z.string().email(),
 *   name: z.string().min(2),
 * });
 *
 * // Schema with refinement (async validation, cross-field validation)
 * const schemaWithRefine = schema.refine(
 *   (data) => data.password === data.confirmPassword,
 *   { message: "Passwords don't match" }
 * );
 *
 * function MyForm() {
 *   const form = useZodForm(schema, {
 *     defaultValues: { email: "", name: "" },
 *   });
 *
 *   return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
 * }
 * ```
 *
 * @param schema - Zod schema for form validation (ZodObject or ZodEffects)
 * @param options - Form options (defaultValues, mode, etc.)
 * @returns UseFormReturn with types inferred from schema
 */
export function useZodForm<TOutput extends FieldValues>(
  // biome-ignore lint/suspicious/noExplicitAny: Zod 4 type compatibility requires flexible input types for schema definitions
  schema: z.ZodType<TOutput, any, any>,
  options?: UseZodFormOptions<TOutput>,
): UseFormReturn<TOutput> {
  // Type assertion needed due to Zod 4 / zodResolver type compatibility
  // The runtime behavior is correct, but TypeScript can't infer the relationship
  // between Zod's input/output types and react-hook-form's FieldValues constraint
  return useForm<TOutput>({
    ...options,
    // biome-ignore lint/suspicious/noExplicitAny: Zod 4 / zodResolver type compatibility requires cast
    resolver: zodResolver(schema as any) as Resolver<TOutput>,
  });
}
