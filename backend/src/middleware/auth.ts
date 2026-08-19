import type { NextFunction, Response } from "express";
import { verifyToken } from "../utils/jwt";
import type { AuthenticatedRequest, UserRole } from "../types";

export function requireAuth(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = verifyToken(token);
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return next(new Error("You do not have access to this resource"));
      }
      req.user = payload;
      next();
    } catch {
      next(new Error("Invalid or expired session"));
    }
  };
}
