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
    SERVER_URL: z.string().optional(),
    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    STORAGE_LOCAL_DIR: z.string().default("uploads"),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default("us-east-1"),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
    S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
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

    if (ctx.value.STORAGE_DRIVER === "s3") {
      const required = ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET", "S3_PUBLIC_URL"] as const;
      for (const key of required) {
        if (!ctx.value[key]) {
          ctx.issues.push({
            code: "custom",
            message: `${key} is required when STORAGE_DRIVER=s3`,
            path: [key],
            input: ctx.value[key],
          });
        }
      }
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
  serverUrl: parsed.data.SERVER_URL || `http://localhost:${parsed.data.PORT}`,
  storage: {
    driver: parsed.data.STORAGE_DRIVER,
    localDir: parsed.data.STORAGE_LOCAL_DIR,
    s3: {
      endpoint: parsed.data.S3_ENDPOINT,
      region: parsed.data.S3_REGION,
      accessKeyId: parsed.data.S3_ACCESS_KEY_ID,
      secretAccessKey: parsed.data.S3_SECRET_ACCESS_KEY,
      bucket: parsed.data.S3_BUCKET,
      publicUrl: parsed.data.S3_PUBLIC_URL,
      forcePathStyle: parsed.data.S3_FORCE_PATH_STYLE,
    },
  },
};
