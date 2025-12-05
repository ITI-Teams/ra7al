// src/server.js
// Main Express server for RAG recommendation service

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/auth.js";
import recommendationRoutes from "./routes/recommendations.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE SETUP
// ==========================================

// Security: Helmet helps secure Express apps by setting HTTP headers
app.use(helmet());

// CORS: Allow Laravel backend to communicate with this service
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "RAG Recommendation Service",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes (protected by auth middleware)
app.use("/api", authMiddleware, recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler
app.use(errorHandler);

// ==========================================
// SERVER STARTUP
// ==========================================

app.listen(PORT, () => {
  logger.info(`🚀 RAG Service running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔑 OpenAI Model: ${process.env.OPENAI_MODEL}`);
  logger.info(`✅ Server started successfully at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  process.exit(0);
});

export default app;
