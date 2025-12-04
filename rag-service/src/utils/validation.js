// ==========================================
// src/utils/validation.js
// Request validation helpers
// ==========================================

export const validateRecommendationRequest = (body) => {
  const errors = [];

  if (!body.user_id) {
    errors.push("user_id is required");
  }

  if (!body.answers || typeof body.answers !== "object") {
    errors.push("answers must be an object");
  }

  if (!body.database_config) {
    errors.push("database_config is required");
  } else {
    const dbConfig = body.database_config;
    if (!dbConfig.host) errors.push("database_config.host is required");
    if (!dbConfig.database) errors.push("database_config.database is required");
    if (!dbConfig.username) errors.push("database_config.username is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
