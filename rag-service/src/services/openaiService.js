// src/services/openaiService.js
// Handles OpenAI API communication for recommendations

import OpenAI from "openai";
import { logger } from "../utils/logger.js";
import "dotenv/config";

/**
 * OpenAI Service Class
 * This is the GENERATION part of RAG
 */
class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";
  }

  /**
   * Generate property recommendations using OpenAI
   *
   * This is where the magic happens! We send:
   * 1. User preferences (from questionnaire)
   * 2. Available properties (from database)
   * 3. Ask AI to rank and explain matches
   *
   * @param {Object} userPreferences - User's questionnaire answers
   * @param {Array} properties - Properties from database
   * @param {Object} userProfile - User's profile data for lifestyle matching
   * @returns {Promise<Object>} Recommendations with scores and explanations
   */
  async generateRecommendations(
    userPreferences,
    properties,
    userProfile = null
  ) {
    try {
      logger.info("Generating recommendations with OpenAI...");

      // Build the prompt for OpenAI
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(
        userPreferences,
        properties,
        userProfile
      );

      logger.debug("Sending request to OpenAI API...");

      // Call OpenAI API
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
        response_format: { type: "json_object" }, // Force JSON response
      });

      const aiResponse = response.choices[0].message.content;
      logger.info("Received response from OpenAI");

      // Parse AI response
      const recommendations = JSON.parse(aiResponse);

      // Add metadata
      recommendations.metadata = {
        model: this.model,
        tokens_used: response.usage.total_tokens,
        generated_at: new Date().toISOString(),
      };

      return recommendations;
    } catch (error) {
      logger.error("OpenAI API error:", error);

      if (error.code === "insufficient_quota") {
        throw new Error(
          "OpenAI API quota exceeded. Please check your billing."
        );
      }

      throw new Error("Failed to generate recommendations: " + error.message);
    }
  }

  /**
   * Build system prompt that defines AI's role and output format
   * @returns {string}
   */
  buildSystemPrompt() {
    return `You are an expert real estate recommendation AI assistant for a student housing platform.

Your task is to analyze user preferences and available properties, then provide personalized recommendations.

IMPORTANT RULES:
1. Consider ALL user preferences including budget, location, lifestyle, and amenities
2. Rank properties by match quality (0-100 score)
3. Provide clear explanations for each recommendation
4. Highlight both pros and cons
5. Consider roommate compatibility if profile data provided
6. Be honest - if a property is not a good match, explain why

OUTPUT FORMAT (strict JSON):
{
  "recommendations": [
    {
      "property_id": number,
      "owner_id":number
      "title": "string",
      "match_score": number (0-100),
      "ranking": number (1, 2, 3...),
      "match_reasons": [
        "Reason 1",
        "Reason 2"
      ],
      "concerns": [
        "Potential concern 1",
        "Potential concern 2"
      ],
      "summary": "One sentence summary of why this is recommended"
    }
  ],
  "insights": {
    "best_match_explanation": "Explanation of top recommendation",
    "budget_analysis": "Analysis of pricing vs user budget",
    "location_insights": "Insights about selected locations",
    "lifestyle_compatibility": "Lifestyle matching insights"
  }
}

Be helpful, accurate, and student-focused in your recommendations.`;
  }

  /**
   * Build user prompt with preferences and properties
   * @param {Object} preferences - User preferences
   * @param {Array} properties - Available properties
   * @param {Object} userProfile - User profile data
   * @returns {string}
   */
  buildUserPrompt(preferences, properties, userProfile) {
    let prompt = `Please analyze these properties and recommend the best matches based on user preferences.

USER PREFERENCES:
${JSON.stringify(preferences, null, 2)}
`;

    if (userProfile) {
      prompt += `

USER PROFILE (for lifestyle matching):
${JSON.stringify(userProfile, null, 2)}
`;
    }

    prompt += `

AVAILABLE PROPERTIES:
${JSON.stringify(properties, null, 2)}

Please provide personalized recommendations with match scores, reasons, and insights.`;

    return prompt;
  }

  /**
   * Validate OpenAI API key
   * @returns {Promise<boolean>}
   */
  async validateApiKey() {
    try {
      await this.client.models.list();
      logger.info(" OpenAI API key validated successfully");
      return true;
    } catch (error) {
      logger.error(" OpenAI API key validation failed:", error.message);
      return false;
    }
  }
}

// Export singleton instance
export const openaiService = new OpenAIService();
