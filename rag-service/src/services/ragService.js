// src/services/ragService.js
// Core RAG (Retrieval-Augmented Generation) orchestration

import { databaseService } from "./databaseService.js";
import { openaiService } from "./openaiService.js";
import { logger } from "../utils/logger.js";

/**
 * RAG Service Class
 * Orchestrates the complete RAG pipeline:
 * 1. RETRIEVAL: Query database for matching properties
 * 2. AUGMENTATION: Enrich with additional context
 * 3. GENERATION: Use AI to rank and explain recommendations
 */
class RAGService {
  /**
   * Main RAG pipeline
   *
   * @param {Object} params
   * @param {number} params.userId - User ID
   * @param {Object} params.answers - User's questionnaire answers
   * @param {Object} params.databaseConfig - Database connection config
   * @returns {Promise<Object>} AI-generated recommendations
   */
  async generateRecommendations({ userId, answers, databaseConfig }) {
    try {
      logger.info("Starting RAG pipeline...", { userId });

      // STEP 1: Initialize database connection
      await databaseService.initialize(databaseConfig);

      // STEP 2: Extract filters from answers
      const filters = this.extractFilters(answers);
      logger.info("Extracted filters:", filters);

      // STEP 3: RETRIEVAL - Query matching properties
      const properties = await databaseService.queryProperties(filters);

      if (properties.length === 0) {
        logger.warn("No properties found matching filters");
        return {
          recommendations: [],
          message:
            "No properties match your criteria. Try adjusting your preferences.",
          total_analyzed: 0,
        };
      }

      logger.info(`Retrieved ${properties.length} properties for analysis`);

      // STEP 4: AUGMENTATION - Enrich property data
      const enrichedProperties = await this.enrichProperties(properties);

      // STEP 5: Get user profile for lifestyle matching
      const userProfile = await databaseService.getUserProfile(userId);

      // STEP 6: Build user preferences object
      const userPreferences = this.buildUserPreferences(answers, filters);

      // STEP 7: GENERATION - Use AI to rank and recommend
      const aiRecommendations = await openaiService.generateRecommendations(
        userPreferences,
        enrichedProperties,
        userProfile
      );

      // STEP 8: Enhance recommendations with full property details
      const finalRecommendations = this.enhanceRecommendations(
        aiRecommendations.recommendations,
        enrichedProperties
      );

      logger.info(`Generated ${finalRecommendations.length} recommendations`);

      return {
        recommendations: finalRecommendations,
        insights: aiRecommendations.insights,
        metadata: {
          total_properties_analyzed: properties.length,
          recommendations_count: finalRecommendations.length,
          filters_applied: filters,
          ...aiRecommendations.metadata,
        },
      };
    } catch (error) {
      logger.error("RAG pipeline error:", error);
      throw error;
    }
  }

  /**
   * Extract database filters from questionnaire answers
   * Maps question responses to database query filters
   *
   * @param {Object} answers - Question ID → Answer mapping
   * @returns {Object} Database filters
   */
  extractFilters(answers) {
    const filters = {};

    // Iterate through answers and map to filters
    Object.entries(answers).forEach(([questionId, answer]) => {
      const value = answer.value;

      // Map based on question ID (adjust based on your seeded questions)
      switch (parseInt(questionId)) {
        case 1: // Budget range
          if (typeof value === "object" && value.min && value.max) {
            filters.minPrice = value.min;
            filters.maxPrice = value.max;
          } else if (typeof value === "number") {
            filters.maxPrice = value;
          }
          break;

        case 2: // City
          filters.city = value;
          break;

        case 4: // Number of roommates
          // Convert roommates preference to rooms count
          if (value.includes("None")) {
            filters.minRooms = 1;
            filters.maxRooms = 1;
          } else if (value.includes("1-2")) {
            filters.minRooms = 2;
            filters.maxRooms = 3;
          } else if (value.includes("3-4")) {
            filters.minRooms = 3;
            filters.maxRooms = 5;
          }
          break;

        case 6: // Smoking
          filters.smokingAllowed = value === true || value === "yes";
          break;

        case 12: // Gender requirement
          if (value.includes("Male only")) {
            filters.genderRequirement = "male";
          } else if (value.includes("Female only")) {
            filters.genderRequirement = "female";
          } else {
            filters.genderRequirement = "mixed";
          }
          break;

        case 14: // Move-in date
          if (value.includes("Immediately")) {
            filters.availableFrom = new Date().toISOString().split("T")[0];
          } else if (value.includes("Within 1 month")) {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            filters.availableFrom = date.toISOString().split("T")[0];
          }
          break;

        default:
          // Store other answers for AI context
          break;
      }
    });

    return filters;
  }

  /**
   * Enrich properties with additional data
   * @param {Array} properties
   * @returns {Promise<Array>}
   */
  async enrichProperties(properties) {
    const propertyIds = properties.map((p) => p.id);
    const amenitiesMap = await databaseService.getPropertyAmenities(
      propertyIds
    );

    return properties.map((property) => ({
      ...property,
      amenities_list: amenitiesMap[property.id] || [],
      // Convert amenities string to array if needed
      amenities_names: property.amenities ? property.amenities.split(",") : [],
    }));
  }

  /**
   * Build structured user preferences for AI
   * @param {Object} answers
   * @param {Object} filters
   * @returns {Object}
   */
  buildUserPreferences(answers, filters) {
    return {
      budget: {
        min: filters.minPrice,
        max: filters.maxPrice,
      },
      location: {
        city: filters.city,
        area: filters.area,
      },
      property: {
        min_rooms: filters.minRooms,
        max_rooms: filters.maxRooms,
        gender_requirement: filters.genderRequirement,
        smoking_allowed: filters.smokingAllowed,
      },
      raw_answers: answers, // Include all answers for context
    };
  }

  /**
   * Enhance AI recommendations with full property details
   * @param {Array} recommendations - AI recommendations
   * @param {Array} properties - Full property data
   * @returns {Array}
   */
  enhanceRecommendations(recommendations, properties) {
    return recommendations.map((rec) => {
      const property = properties.find((p) => p.id === rec.property_id);

      if (!property) return rec;

      return {
        ...rec,
        property: {
          id: property.id,
          title: property.title,
          description: property.description,
          price: parseFloat(property.price),
          address: property.address,
          city: property.city_name,
          area: property.area_name,
          rooms_count: property.rooms_count,
          bathrooms_count: property.bathrooms_count,
          size: property.size,
          gender_requirement: property.gender_requirement,
          smoking_allowed: property.smoking_allowed === 1,
          available_from: property.available_from,
          average_rating: parseFloat(property.average_rating) || 0,
          reviews_count: parseInt(property.reviews_count) || 0,
          amenities: property.amenities_list,
          owner: {
            name: property.owner_name,
            phone: property.owner_phone,
          },
        },
      };
    });
  }
}

// Export singleton instance
export const ragService = new RAGService();
