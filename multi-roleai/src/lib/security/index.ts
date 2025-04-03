/**
 * Security Module for Multi-RoleAI
 * 
 * This module exports all security-related functionality including:
 * - Sandboxed execution environment
 * - Permission system for tool access
 * - Content filtering and safety measures
 * - Rate limiting and resource allocation
 */

// Export types
export type { SandboxConfig, ExecutionResult } from './sandbox';
export type { Permission, PermissionCondition, PermissionRequest } from './permissions';
export type { ContentSafetyResult, FilterConfig } from './contentFiltering';
export type { RateLimit, ResourceQuota, UsageMetrics } from './rateLimiter';

// Export enums
export { PermissionLevel, ResourceType } from './permissions';
export { ContentCategory } from './contentFiltering';
export { LimitType } from './rateLimiter';

// Default exports
import sandbox from './sandbox';
import permissions, { PermissionLevel, ResourceType } from './permissions';
import contentFilter from './contentFiltering';
import rateLimiter, { LimitType } from './rateLimiter';

export { sandbox, permissions, contentFilter, rateLimiter };

/**
 * Security utilities for various Multi-RoleAI components
 */
export const security = {
  sandbox,
  permissions,
  contentFilter,
  rateLimiter,
  
  /**
   * Validates if a user has permissions to perform an action
   */
  async validateUserAction(userId: string, action: string, resourceId?: string): Promise<boolean> {
    // Implement user action validation logic combining permissions and rate limiting
    
    // Map action to resource type and permission level
    const actionMap: Record<string, [ResourceType, PermissionLevel]> = {
      'execute_tool': [ResourceType.TOOL, PermissionLevel.EXECUTE],
      'read_file': [ResourceType.FILE, PermissionLevel.READ],
      'write_file': [ResourceType.FILE, PermissionLevel.WRITE],
      'deploy_app': [ResourceType.DEPLOYMENT, PermissionLevel.WRITE],
      'admin_action': [ResourceType.SYSTEM, PermissionLevel.ADMIN],
      // Add more mappings as needed
    };
    
    const [resourceType, permissionLevel] = actionMap[action] || [ResourceType.SYSTEM, PermissionLevel.READ];
    
    // Check permissions
    const hasPermission = await permissions.hasPermission(
      userId,
      resourceType,
      resourceId || '*',
      permissionLevel
    );
    
    if (!hasPermission) {
      return false;
    }
    
    // Check rate limits
    const limitType = this.mapActionToLimitType(action);
    
    const isWithinLimits = await rateLimiter.isAllowed(userId, limitType, resourceId);
    
    if (isWithinLimits) {
      // If within limits, consume the limit
      await rateLimiter.consume(userId, limitType, resourceId);
    }
    
    return isWithinLimits;
  },
  
  /**
   * Maps an action to a rate limit type
   */
  mapActionToLimitType(action: string): LimitType {
    const limitTypeMap: Record<string, LimitType> = {
      'execute_tool': LimitType.TOOL_USAGE,
      'read_file': LimitType.API_CALLS,
      'write_file': LimitType.STORAGE,
      'deploy_app': LimitType.COMPUTE_RESOURCES,
      'admin_action': LimitType.API_CALLS,
    };
    
    return limitTypeMap[action] || LimitType.API_CALLS;
  },
  
  /**
   * Applies security checks to content
   */
  async secureScanContent(content: string, userId?: string, context?: string): Promise<{
    isAllowed: boolean;
    safeContent?: string;
    reason?: string;
  }> {
    const result = await contentFilter.analyzeContent(content, userId);
    
    return {
      isAllowed: result.isAllowed,
      safeContent: result.redactedContent || content,
      reason: result.reason
    };
  }
};

export default security;
