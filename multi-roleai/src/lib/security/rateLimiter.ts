/**
 * Rate Limiting and Resource Allocation Module for Multi-RoleAI
 * 
 * This module implements rate limiting and resource allocation controls
 * to prevent abuse, ensure fair usage, and maintain system stability.
 */

import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { prisma } from '../../lib/prisma';

// Redis client for rate limiting implementation
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export enum LimitType {
  API_CALLS = 'api_calls',
  TOOL_USAGE = 'tool_usage',
  COMPUTE_RESOURCES = 'compute_resources',
  STORAGE = 'storage',
  NETWORK = 'network',
  TOKEN_USAGE = 'token_usage',
}

export interface RateLimit {
  type: LimitType;
  limit: number;
  window: number; // Time window in seconds
  userId?: string;
  resourceId?: string;
}

export interface ResourceQuota {
  userId: string;
  computeTimeSeconds: number; // CPU time in seconds
  memoryMb: number; // Memory in MB
  storageBytes: number; // Storage in bytes
  apiCalls: number; // Number of API calls
  tokenUsage: number; // LLM token usage
  networkRequestsMb: number; // Network bandwidth in MB
}

export interface UsageMetrics {
  current: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * RateLimiter class handles rate limiting and resource allocation
 * to ensure fair usage and prevent abuse
 */
export class RateLimiter {
  private readonly defaultLimits: Record<LimitType, RateLimit> = {
    [LimitType.API_CALLS]: {
      type: LimitType.API_CALLS,
      limit: 1000, // 1000 API calls
      window: 3600, // per hour
    },
    [LimitType.TOOL_USAGE]: {
      type: LimitType.TOOL_USAGE,
      limit: 100, // 100 tool calls
      window: 3600, // per hour
    },
    [LimitType.COMPUTE_RESOURCES]: {
      type: LimitType.COMPUTE_RESOURCES,
      limit: 300, // 300 seconds of CPU time
      window: 3600, // per hour
    },
    [LimitType.STORAGE]: {
      type: LimitType.STORAGE,
      limit: 104857600, // 100MB storage
      window: 86400, // per day
    },
    [LimitType.NETWORK]: {
      type: LimitType.NETWORK,
      limit: 52428800, // 50MB network traffic
      window: 3600, // per hour
    },
    [LimitType.TOKEN_USAGE]: {
      type: LimitType.TOKEN_USAGE,
      limit: 100000, // 100K tokens
      window: 86400, // per day
    },
  };

  // User plan tiers and multipliers
  private readonly planMultipliers: Record<string, number> = {
    'free': 1,
    'basic': 2,
    'premium': 5,
    'enterprise': 10,
  };

  /**
   * Checks if an action would exceed rate limits
   * @param userId User ID
   * @param type Limit type
   * @param resourceId Optional resource ID for specific resource limits
   * @param count Number of units to consume (default: 1)
   * @returns Whether the action is allowed
   */
  async isAllowed(
    userId: string,
    type: LimitType,
    resourceId?: string,
    count: number = 1
  ): Promise<boolean> {
    try {
      const key = this.getRateLimitKey(userId, type, resourceId);
      const currentUsage = await this.getCurrentUsage(key);
      
      // Get user's plan to determine their limit
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, plan: true },
      });
      
      const userPlan = user?.plan || 'free';
      const multiplier = this.planMultipliers[userPlan] || 1;
      
      // Get the base limit for this type
      const baseLimit = this.defaultLimits[type];
      const adjustedLimit = baseLimit.limit * multiplier;
      
      // Check if the action would exceed the limit
      return (currentUsage + count) <= adjustedLimit;
    } catch (error) {
      logger.error(`Rate limiting error for user ${userId}:`, error);
      // Default to allowing if there's an error, but log it
      return true;
    }
  }

  /**
   * Consumes rate limit units for an action
   * @param userId User ID
   * @param type Limit type
   * @param resourceId Optional resource ID for specific resource limits
   * @param count Number of units to consume (default: 1)
   * @returns Whether the consumption was successful
   */
  async consume(
    userId: string,
    type: LimitType,
    resourceId?: string,
    count: number = 1
  ): Promise<boolean> {
    try {
      // First check if the action is allowed
      const isActionAllowed = await this.isAllowed(userId, type, resourceId, count);
      
      if (!isActionAllowed) {
        logger.warn(`Rate limit exceeded for user ${userId}, type ${type}`);
        return false;
      }
      
      // If allowed, increment the counter
      const key = this.getRateLimitKey(userId, type, resourceId);
      const baseLimit = this.defaultLimits[type];
      
      // Use Redis INCRBY and EXPIRE commands
      await redis.incrby(key, count);
      await redis.expire(key, baseLimit.window);
      
      // Log the usage for analytics
      await this.logUsage(userId, type, resourceId, count);
      
      return true;
    } catch (error) {
      logger.error(`Error consuming rate limit for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Gets current usage metrics for a specific limit type
   * @param userId User ID
   * @param type Limit type
   * @param resourceId Optional resource ID for specific resource limits
   * @returns Usage metrics including current usage, limit, and reset time
   */
  async getUsageMetrics(
    userId: string,
    type: LimitType,
    resourceId?: string
  ): Promise<UsageMetrics> {
    try {
      const key = this.getRateLimitKey(userId, type, resourceId);
      const currentUsage = await this.getCurrentUsage(key);
      
      // Get user's plan to determine their limit
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, plan: true },
      });
      
      const userPlan = user?.plan || 'free';
      const multiplier = this.planMultipliers[userPlan] || 1;
      
      // Get the base limit for this type
      const baseLimit = this.defaultLimits[type];
      const adjustedLimit = baseLimit.limit * multiplier;
      
      // Get the TTL for the key to calculate reset time
      const ttl = await redis.ttl(key);
      const resetAt = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : baseLimit.window * 1000));
      
      return {
        current: currentUsage,
        limit: adjustedLimit,
        remaining: Math.max(0, adjustedLimit - currentUsage),
        resetAt,
      };
    } catch (error) {
      logger.error(`Error getting usage metrics for user ${userId}:`, error);
      
      // Return default metrics in case of error
      const baseLimit = this.defaultLimits[type];
      return {
        current: 0,
        limit: baseLimit.limit,
        remaining: baseLimit.limit,
        resetAt: new Date(Date.now() + baseLimit.window * 1000),
      };
    }
  }

  /**
   * Gets the current quota and usage for a user
   * @param userId User ID
   * @returns The user's resource quota and current usage
   */
  async getUserQuota(userId: string): Promise<{
    quota: ResourceQuota;
    usage: Partial<ResourceQuota>;
  }> {
    try {
      // Get user's plan to determine their quotas
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, plan: true },
      });
      
      const userPlan = user?.plan || 'free';
      const multiplier = this.planMultipliers[userPlan] || 1;
      
      // Base quotas
      const baseQuota: ResourceQuota = {
        userId,
        computeTimeSeconds: 300 * multiplier, // 5 minutes * multiplier
        memoryMb: 512 * multiplier, // 512MB * multiplier
        storageBytes: 104857600 * multiplier, // 100MB * multiplier
        apiCalls: 1000 * multiplier, // 1000 calls * multiplier
        tokenUsage: 100000 * multiplier, // 100K tokens * multiplier
        networkRequestsMb: 50 * multiplier, // 50MB * multiplier
      };
      
      // Get current usage for all types
      const usage: Partial<ResourceQuota> = {
        apiCalls: await this.getCurrentUsage(this.getRateLimitKey(userId, LimitType.API_CALLS)),
        computeTimeSeconds: await this.getCurrentUsage(this.getRateLimitKey(userId, LimitType.COMPUTE_RESOURCES)),
        storageBytes: await this.getCurrentUsage(this.getRateLimitKey(userId, LimitType.STORAGE)),
        tokenUsage: await this.getCurrentUsage(this.getRateLimitKey(userId, LimitType.TOKEN_USAGE)),
        networkRequestsMb: await this.getCurrentUsage(this.getRateLimitKey(userId, LimitType.NETWORK)),
      };
      
      return { quota: baseQuota, usage };
    } catch (error) {
      logger.error(`Error getting quota for user ${userId}:`, error);
      
      // Return default quota in case of error
      const defaultQuota: ResourceQuota = {
        userId,
        computeTimeSeconds: 300,
        memoryMb: 512,
        storageBytes: 104857600,
        apiCalls: 1000,
        tokenUsage: 100000,
        networkRequestsMb: 50,
      };
      
      return { quota: defaultQuota, usage: {} };
    }
  }

  /**
   * Resets usage for a specific user and limit type
   * @param userId User ID
   * @param type Limit type
   * @param resourceId Optional resource ID for specific resource limits
   */
  async resetUsage(
    userId: string,
    type: LimitType,
    resourceId?: string
  ): Promise<boolean> {
    try {
      const key = this.getRateLimitKey(userId, type, resourceId);
      await redis.del(key);
      logger.info(`Reset usage for user ${userId}, type ${type}`);
      return true;
    } catch (error) {
      logger.error(`Error resetting usage for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Updates a user's plan, which affects their rate limits and quotas
   * @param userId User ID
   * @param plan New plan name
   */
  async updateUserPlan(userId: string, plan: string): Promise<boolean> {
    try {
      if (!this.planMultipliers[plan]) {
        logger.error(`Invalid plan ${plan} for user ${userId}`);
        return false;
      }
      
      await prisma.user.update({
        where: { id: userId },
        data: { plan },
      });
      
      logger.info(`Updated plan for user ${userId} to ${plan}`);
      return true;
    } catch (error) {
      logger.error(`Error updating plan for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Sets a custom rate limit for a specific user and type
   * @param userId User ID
   * @param type Limit type
   * @param limit New limit
   * @param window Time window in seconds
   * @param resourceId Optional resource ID for specific resource limits
   */
  async setCustomLimit(
    userId: string,
    type: LimitType,
    limit: number,
    window: number,
    resourceId?: string
  ): Promise<boolean> {
    try {
      await prisma.customRateLimit.upsert({
        where: {
          userId_type_resourceId: {
            userId,
            type,
            resourceId: resourceId || '',
          },
        },
        update: {
          limit,
          window,
        },
        create: {
          userId,
          type,
          resourceId: resourceId || '',
          limit,
          window,
        },
      });
      
      logger.info(`Set custom limit for user ${userId}, type ${type}: ${limit} per ${window}s`);
      return true;
    } catch (error) {
      logger.error(`Error setting custom limit for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Gets the current usage value for a key
   */
  private async getCurrentUsage(key: string): Promise<number> {
    const value = await redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Generates a Redis key for rate limiting
   */
  private getRateLimitKey(userId: string, type: LimitType, resourceId?: string): string {
    return `rate_limit:${userId}:${type}${resourceId ? `:${resourceId}` : ''}`;
  }

  /**
   * Logs usage for analytics and audit purposes
   */
  private async logUsage(
    userId: string,
    type: LimitType,
    resourceId?: string,
    count: number = 1
  ): Promise<void> {
    try {
      await prisma.usageLog.create({
        data: {
          id: uuidv4(),
          userId,
          type,
          resourceId: resourceId || null,
          amount: count,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error logging usage for user ${userId}:`, error);
    }
  }
}

export default new RateLimiter();
