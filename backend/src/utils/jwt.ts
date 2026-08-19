import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import type { AuthTokenPayload } from "../types";

const authTokenPayloadSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid token payload"),
  role: z.enum(["doctor", "patient"]),
});

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

/**
 * Verifies the signature AND shape of the token. A validly-signed token with
 * a malformed/legacy payload (e.g. a non-ObjectId id, or an unexpected role)
 * is rejected here rather than trusted downstream, where it could otherwise
 * cause an uncaught Mongoose CastError or route to the wrong role's logic.
 */
export function verifyToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  return authTokenPayloadSchema.parse(decoded);
}
