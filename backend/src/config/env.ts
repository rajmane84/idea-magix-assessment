import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    CLIENT_URL: z.string().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    EMAIL_FROM: z.string().default("Prescripto <onboarding@resend.dev>"),
    RESEND_API_KEY: z.string().optional(),
  })
  .check((ctx) => {
    if (ctx.value.NODE_ENV === "production" && !ctx.value.RESEND_API_KEY) {
      ctx.issues.push({
        code: "custom",
        message: "RESEND_API_KEY is required in production",
        path: ["RESEND_API_KEY"],
        input: ctx.value.RESEND_API_KEY,
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  console.error(`Invalid or missing environment variables:\n${details}`);
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  mongodbUri: parsed.data.MONGODB_URI,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  clientUrl: parsed.data.CLIENT_URL,
  nodeEnv: parsed.data.NODE_ENV,
  isProd: parsed.data.NODE_ENV === "production",
  emailFrom: parsed.data.EMAIL_FROM,
  resendApiKey: parsed.data.RESEND_API_KEY,
};
