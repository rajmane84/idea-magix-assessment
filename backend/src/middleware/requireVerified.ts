import type { NextFunction, Response } from "express";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../types";

/** Blocks doctors/patients who haven't completed OTP verification from sensitive actions. */
export function requireVerified() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());

    const user =
      req.user.role === "doctor"
        ? await Doctor.findById(req.user.id).select("isVerified")
        : await Patient.findById(req.user.id).select("isVerified");
    if (!user) return next(ApiError.notFound("Account not found"));
    if (!user.isVerified) {
      return next(ApiError.forbidden("Please verify your email before continuing"));
    }
    next();
  };
}
