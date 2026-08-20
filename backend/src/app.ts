import path from "node:path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimit";
import { env } from "./config/env";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ success: true, message: "OK" }));

// Serves profile images/prescription PDFs when STORAGE_DRIVER=local (e.g. in production on
// Render). Unused when STORAGE_DRIVER=s3, since assets are served from the S3-compatible bucket.
if (env.storage.driver === "local") {
  app.use("/uploads", express.static(path.resolve(env.storage.localDir)));
}

app.use("/api", generalLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);
