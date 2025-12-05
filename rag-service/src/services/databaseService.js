// src/services/databaseService.js
// Handles all database queries for property retrieval

import mysql from "mysql2/promise";
import { logger } from "../utils/logger.js";

/**
 * Database Service Class
 * Manages MySQL connection pool and property queries
 */
class DatabaseService {
  constructor() {
    this.pool = null;
  }

  /**
   * Initialize database connection pool
   * @param {Object} config - Database configuration
   */
  async initialize(config) {
    try {
      this.pool = mysql.createPool({
        host: config.host || process.env.DB_HOST,
        port: config.port || process.env.DB_PORT,
        database: config.database || process.env.DB_DATABASE,
        user: config.username || process.env.DB_USERNAME,
        password: config.password || process.env.DB_PASSWORD,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });

      // Test connection
      const connection = await this.pool.getConnection();
      logger.info("✅ Database connection established successfully");
      connection.release();
    } catch (error) {
      logger.error("❌ Database connection failed:", error);
      throw new Error("Failed to connect to database");
    }
  }

  /**
   * Query properties based on user preferences
   * This is the RETRIEVAL part of RAG
   *
   * @param {Object} filters - User preferences from questionnaire
   * @returns {Promise<Array>} Array of matching properties
   */
  async queryProperties(filters) {
    try {
      // Build dynamic SQL query based on filters
      let query = `
        SELECT 
          p.*,
          a.name as area_name,
          c.name as city_name,
          u.name as owner_name,
          u.phone as owner_phone,
          GROUP_CONCAT(DISTINCT am.name) as amenities,
          AVG(pc.rating) as average_rating,
          COUNT(DISTINCT pc.id) as reviews_count
        FROM properties p
        INNER JOIN areas a ON p.area_id = a.id
        INNER JOIN cities c ON a.city_id = c.id
        INNER JOIN users u ON p.owner_id = u.id
        LEFT JOIN property_amenities pa ON p.id = pa.property_id
        LEFT JOIN amenities am ON pa.amenity_id = am.id
        LEFT JOIN property_comments pc ON p.id = pc.property_id
        WHERE p.status = 'available'
      `;

      const params = [];

      // Apply filters dynamically

      // City filter
      if (filters.city) {
        query += ` AND c.name = ?`;
        params.push(filters.city);
      }

      // Area filter
      if (filters.area) {
        query += ` AND a.name = ?`;
        params.push(filters.area);
      }

      // Price range filter
      if (filters.minPrice) {
        query += ` AND p.price >= ?`;
        params.push(filters.minPrice);
      }
      if (filters.maxPrice) {
        query += ` AND p.price <= ?`;
        params.push(filters.maxPrice);
      }

      // Gender requirement
      if (filters.genderRequirement && filters.genderRequirement !== "mixed") {
        query += ` AND (p.gender_requirement = ? OR p.gender_requirement = 'mixed')`;
        params.push(filters.genderRequirement);
      }

      // Smoking preference
      if (filters.smokingAllowed !== undefined) {
        query += ` AND p.smoking_allowed = ?`;
        params.push(filters.smokingAllowed);
      }

      // Rooms count
      if (filters.minRooms) {
        query += ` AND p.total_rooms >= ?`;
        params.push(filters.minRooms);
      }
      if (filters.maxRooms) {
        query += ` AND p.total_rooms <= ?`;
        params.push(filters.maxRooms);
      }

      // Size (square meters)
      if (filters.minSize) {
        query += ` AND p.size >= ?`;
        params.push(filters.minSize);
      }

      // Available from date
      if (filters.availableFrom) {
        query += ` AND p.available_from <= ?`;
        params.push(filters.availableFrom);
      }

      // Group by property
      query += ` GROUP BY p.id`;

      // Order by relevance (you can customize this)
      query += ` ORDER BY average_rating DESC, p.price ASC`;

      // Limit results for AI processing
      const limit = parseInt(process.env.MAX_PROPERTIES_TO_ANALYZE) || 20;
      query += ` LIMIT ?`;
      params.push(limit);

      logger.info("Executing property query with filters:", filters);

      const [rows] = await this.pool.execute(query, params);

      logger.info(`Found ${rows.length} matching properties`);

      return rows;
    } catch (error) {
      logger.error("Error querying properties:", error);
      throw new Error("Failed to query properties from database");
    }
  }

  /**
   * Get property amenities for specific properties
   * @param {Array<number>} propertyIds
   * @returns {Promise<Object>} Map of property_id to amenities array
   */
  async getPropertyAmenities(propertyIds) {
    if (!propertyIds || propertyIds.length === 0) return {};

    try {
      const placeholders = propertyIds.map(() => "?").join(",");
      const query = `
        SELECT 
          pa.property_id,
          a.name as amenity_name,
          a.icon as amenity_icon
        FROM property_amenities pa
        INNER JOIN amenities a ON pa.amenity_id = a.id
        WHERE pa.property_id IN (${placeholders})
      `;

      const [rows] = await this.pool.execute(query, propertyIds);

      // Group by property_id
      const amenitiesMap = {};
      rows.forEach((row) => {
        if (!amenitiesMap[row.property_id]) {
          amenitiesMap[row.property_id] = [];
        }
        amenitiesMap[row.property_id].push({
          name: row.amenity_name,
          icon: row.amenity_icon,
        });
      });

      return amenitiesMap;
    } catch (error) {
      logger.error("Error fetching amenities:", error);
      return {};
    }
  }

  /**
   * Get user profile for lifestyle matching
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(userId) {
    try {
      const query = `
        SELECT * FROM user_profiles
        WHERE user_id = ?
        LIMIT 1
      `;

      const [rows] = await this.pool.execute(query, [userId]);
      return rows[0] || null;
    } catch (error) {
      logger.error("Error fetching user profile:", error);
      return null;
    }
  }

  /**
   * Close database connection pool
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      logger.info("Database connection pool closed");
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
