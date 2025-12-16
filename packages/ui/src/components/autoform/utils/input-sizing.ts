type InputSizing = {
  size?: number;
  className?: string;
};

function toFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return;
  }
  let n: number;
  if (typeof value === "number") {
    n = value;
  } else if (typeof value === "string") {
    n = Number(value);
  } else {
    n = Number.NaN;
  }
  return Number.isFinite(n) ? n : undefined;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getDecimalPlaces(step: unknown): number {
  if (step === undefined || step === null) {
    return 0;
  }
  if (step === "any") {
    return 0;
  }
  const stepStr = String(step);
  const dot = stepStr.indexOf(".");
  if (dot === -1) {
    return 0;
  }
  return Math.max(0, stepStr.length - dot - 1);
}

function deriveStringSizing(inputProps: any): InputSizing {
  const type = String(inputProps?.type ?? "");

  // Only apply to typical text inputs; keep special inputs (email/url/password) full-width.
  const stringish =
    type === "" ||
    type === "text" ||
    type === "search" ||
    type === "tel" ||
    type === "url" ||
    type === "email" ||
    type === "password";

  if (!stringish || type === "email" || type === "url" || type === "password") {
    return {};
  }

  const maxLength = toFiniteNumber(inputProps?.maxLength ?? inputProps?.maxlength);
  if (maxLength === undefined || maxLength <= 0 || maxLength > 40) {
    return {};
  }

  return {
    size: clamp(Math.round(maxLength), 6, 32),
    className: "w-auto",
  };
}

function deriveNumberSizing(inputProps: any): InputSizing {
  const min = toFiniteNumber(inputProps?.min);
  const max = toFiniteNumber(inputProps?.max);
  if (min === undefined && max === undefined) {
    return {};
  }

  const absMax = Math.max(Math.abs(min ?? 0), Math.abs(max ?? 0));
  const integerDigits = absMax === 0 ? 1 : String(Math.trunc(absMax)).length;
  const sign = (min ?? 0) < 0 ? 1 : 0;
  const decimals = getDecimalPlaces(inputProps?.step);

  const total = integerDigits + sign + 1 + (decimals > 0 ? 1 + decimals : 0);
  return {
    size: clamp(total, 6, 16),
    className: "w-auto",
  };
}

/**
 * Derive a compact (but usable) input width from typical HTML/Zod constraints.
 * We intentionally only auto-shrink "bounded" fields; unbounded fields stay full-width.
 *
 * - Strings: uses `maxLength`
 * - Numbers: uses `min`/`max` (+ `step` for decimals)
 *
 * Consumers should merge `className` so that user-provided classes come last (override).
 */
export function deriveCompactInputSizing(inputProps: any): InputSizing {
  const type = String(inputProps?.type ?? "");

  if (type === "number") {
    return deriveNumberSizing(inputProps);
  }

  return deriveStringSizing(inputProps);
}
