// ==========================================
// src/middleware/auth.js
// API key authentication middleware
// ==========================================

import { logger } from "../utils/logger.js";

export const authMiddleware = (req, res, next) => {
  // Get API key from header
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  // Skip auth in development if no API key configured
  if (process.env.NODE_ENV === "development" && !process.env.API_KEY) {
    logger.warn("⚠️  Running without authentication in development mode");
    return next();
  }

  // Validate API key
  if (!apiKey) {
    logger.warn("Authentication failed: No API key provided", {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      message: "API key required",
    });
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn("Authentication failed: Invalid API key", {
      ip: req.ip,
      path: req.path,
    });
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
  }

  // Authentication successful
  logger.debug("Authentication successful");
  next();
};
