import { z } from "zod";

/**
 * Trimmed string that reports "<label> is required" when empty. Uses `.pipe()`
 * so the required check short-circuits — an empty value only ever shows the
 * "required" message, never a second "too short" message stacked on top.
 */
export function requiredString(label: string): z.ZodString;
export function requiredString(
  label: string,
  minLength: number,
  minMessage?: string
): z.ZodPipe<z.ZodString, z.ZodString>;
export function requiredString(label: string, minLength = 1, minMessage?: string) {
  const required = z.string().trim().min(1, `${label} is required`);
  if (minLength <= 1) return required;
  return required.pipe(
    z.string().min(minLength, minMessage ?? `${label} must be at least ${minLength} characters`)
  );
}

/**
 * Number field for inputs registered with `{ setValueAs: emptyStringToUndefined }`
 * (see below), so an empty field arrives as `undefined` rather than `NaN` and
 * reports a clean "<label> is required" message. Pass `build` to chain
 * further checks (min/max) onto the base number schema.
 */
export function requiredNumber(label: string, build: (schema: z.ZodNumber) => z.ZodNumber = (s) => s) {
  return build(z.number({ error: () => `${label} is required` }));
}

/** Use as `register(name, { setValueAs: emptyStringToUndefined })` for number inputs. */
export function emptyStringToUndefined(value: string) {
  return value === "" ? undefined : Number(value);
}
