import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import type { AuthTokenPayload } from "../types";

const authTokenPayloadSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid token payload"),
  role: z.enum(["doctor", "patient"]),
});

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  return authTokenPayloadSchema.parse(decoded);
}
