// src/routes/recommendations.js
// API routes for recommendation service

import express from "express";
import { ragService } from "../services/ragService.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * POST /api/recommend
 * Main recommendation endpoint
 *
 * Request Body:
 * {
 *   "user_id": 1,
 *   "session_id": "uuid",
 *   "answers": { ... },
 *   "database_config": { ... }
 * }
 */
router.post("/recommend", async (req, res, next) => {
  try {
    const { user_id, session_id, answers, database_config } = req.body;

    // Validate required fields
    if (!user_id || !answers || !database_config) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: user_id, answers, database_config",
      });
    }

    logger.info("Recommendation request received", {
      user_id,
      session_id,
      answers_count: Object.keys(answers).length,
    });

    // Generate recommendations using RAG pipeline
    const recommendations = await ragService.generateRecommendations({
      userId: user_id,
      answers,
      databaseConfig: database_config,
    });

    // Log success
    logger.info("Recommendations generated successfully", {
      user_id,
      session_id,
      recommendations_count: recommendations.recommendations.length,
    });

    res.json({
      success: true,
      data: recommendations,
      session_id,
    });
  } catch (error) {
    logger.error("Error in recommendation endpoint:", error);
    next(error);
  }
});

/**
 * POST /api/validate
 * Validate service configuration and connectivity
 */
router.post("/validate", async (req, res, next) => {
  try {
    const { database_config } = req.body;

    if (!database_config) {
      return res.status(400).json({
        success: false,
        message: "database_config is required",
      });
    }

    // Test database connection
    const { databaseService } = await import("../services/databaseService.js");
    await databaseService.initialize(database_config);

    // Test OpenAI API
    const { openaiService } = await import("../services/openaiService.js");
    const isValid = await openaiService.validateApiKey();

    res.json({
      success: true,
      message: "Service configuration validated",
      checks: {
        database: true,
        openai: isValid,
      },
    });
  } catch (error) {
    logger.error("Validation error:", error);
    res.status(500).json({
      success: false,
      message: "Validation failed",
      error: error.message,
    });
  }
});

/**
 * GET /api/status
 * Service status and health check
 */
router.get("/status", (req, res) => {
  res.json({
    success: true,
    service: "RAG Recommendation Service",
    status: "operational",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    configuration: {
      model: process.env.OPENAI_MODEL,
      max_properties: process.env.MAX_PROPERTIES_TO_ANALYZE,
      rate_limit: process.env.RATE_LIMIT_MAX_REQUESTS,
    },
  });
});

export default router;
