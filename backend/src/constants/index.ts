import { env } from "../config/env";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
