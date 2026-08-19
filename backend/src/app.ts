import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => res.json({ success: true, message: "OK" }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);
