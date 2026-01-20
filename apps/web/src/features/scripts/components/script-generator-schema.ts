import { z } from "zod";

export const industries = [
  "technology",
  "healthcare",
  "finance",
  "retail",
  "manufacturing",
  "other",
] as const;

export const roles = ["ceo", "cto", "cfo", "vp_sales", "director", "manager", "other"] as const;

export const companySizes = ["startup", "small", "medium", "enterprise"] as const;

export const tones = ["professional", "casual", "consultative", "assertive"] as const;

export const scriptLengths = ["concise", "standard", "detailed"] as const;

export const ScriptGeneratorSchema = z.object({
  prospectId: z.string().min(1, "Please select a prospect"),
  industry: z.enum(industries).optional(),
  role: z.enum(roles).optional(),
  painPoints: z.array(z.string()).optional(),
  companySize: z.enum(companySizes).optional(),
  tone: z.enum(tones).optional(),
  scriptLength: z.enum(scriptLengths).optional(),
});

export type ScriptGeneratorData = z.infer<typeof ScriptGeneratorSchema>;

export const industryLabels: Record<(typeof industries)[number], string> = {
  technology: "Technology",
  healthcare: "Healthcare",
  finance: "Finance & Banking",
  retail: "Retail",
  manufacturing: "Manufacturing",
  other: "Other",
};

export const roleLabels: Record<(typeof roles)[number], string> = {
  ceo: "CEO / Founder",
  cto: "CTO / Technical Lead",
  cfo: "CFO / Finance Lead",
  vp_sales: "VP of Sales",
  director: "Director",
  manager: "Manager",
  other: "Other",
};

export const companySizeLabels: Record<(typeof companySizes)[number], string> = {
  startup: "Startup (1-50 employees)",
  small: "Small (51-200 employees)",
  medium: "Medium (201-1000 employees)",
  enterprise: "Enterprise (1000+ employees)",
};

export const toneLabels: Record<(typeof tones)[number], string> = {
  professional: "Professional",
  casual: "Casual & Friendly",
  consultative: "Consultative",
  assertive: "Assertive",
};

export const scriptLengthLabels: Record<(typeof scriptLengths)[number], string> = {
  concise: "Concise (Quick call)",
  standard: "Standard",
  detailed: "Detailed (Discovery call)",
};
