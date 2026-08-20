import { z } from "zod";

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

export function requiredNumber(label: string, build: (schema: z.ZodNumber) => z.ZodNumber = (s) => s) {
  return build(z.number({ error: () => `${label} is required` }));
}

export function emptyStringToUndefined(value: string) {
  return value === "" ? undefined : Number(value);
}
