import type { NextFunction, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest, UserRole } from "../types";

export function requireAuth(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : undefined;
    const token = req.cookies?.token ?? bearer;

    if (!token) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    try {
      const payload = verifyToken(token);
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return next(ApiError.forbidden("You do not have access to this resource"));
      }
      req.user = payload;
      next();
    } catch {
      next(ApiError.unauthorized("Invalid or expired session"));
    }
  };
}
