import type { Request } from "express";

export type UserRole = "doctor" | "patient";

export interface AuthTokenPayload {
  id: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}
