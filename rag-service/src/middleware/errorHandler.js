// ==========================================
// src/middleware/errorHandler.js
// Global error handler
// ==========================================

import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error("Global error handler:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // OpenAI specific errors
  if (err.message.includes("OpenAI")) {
    return res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Database errors
  if (err.message.includes("database") || err.code === "ECONNREFUSED") {
    return res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.details,
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : undefined,
  });
};
