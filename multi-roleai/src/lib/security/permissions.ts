/**
 * Permission System for Multi-RoleAI
 * 
 * This module implements a comprehensive permission system to control
 * access to tools, resources, and features based on user roles and
 * explicit grants.
 */

import { Tool, ToolType } from '../tools/types';
import { User } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

export enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  EXECUTE = 'execute',
  WRITE = 'write',
  ADMIN = 'admin',
}

export enum ResourceType {
  TOOL = 'tool',
  FILE = 'file',
  NETWORK = 'network',
  WORKSPACE = 'workspace',
  USER_DATA = 'user_data',
  SYSTEM = 'system',
  DEPLOYMENT = 'deployment',
}

export interface Permission {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  level: PermissionLevel;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  type: 'time_limit' | 'rate_limit' | 'ip_range' | 'custom';
  value: any;
}

export interface PermissionRequest {
  userId: string;
  resourceType: ResourceType;
  resourceId: string;
  level: PermissionLevel;
}

export interface RolePermission {
  role: string;
  permissions: Permission[];
}

/**
 * PermissionManager handles permission checks and management
 * for all protected resources in the Multi-RoleAI system
 */
export class PermissionManager {
  private defaultRolePermissions: Record<string, Permission[]> = {
    'admin': [
      {
        id: 'admin-all',
        resourceType: ResourceType.SYSTEM,
        resourceId: '*',
        level: PermissionLevel.ADMIN,
      }
    ],
    'user': [
      {
        id: 'user-tools-basic',
        resourceType: ResourceType.TOOL,
        resourceId: 'basic-tools',
        level: PermissionLevel.EXECUTE,
      },
      {
        id: 'user-workspace',
        resourceType: ResourceType.WORKSPACE,
        resourceId: 'own',
        level: PermissionLevel.WRITE,
      }
    ],
    'guest': [
      {
        id: 'guest-tools-basic',
        resourceType: ResourceType.TOOL,
        resourceId: 'basic-tools',
        level: PermissionLevel.READ,
      }
    ]
  };

  // Define tool permission mapping based on the actual ToolType enum values from tools/types.ts
  private toolTypePermissions: Record<string, PermissionLevel> = {
    'BASIC': PermissionLevel.EXECUTE,
    'FILE_SYSTEM': PermissionLevel.WRITE,
    'NETWORK': PermissionLevel.EXECUTE,
    'MULTI_MODAL': PermissionLevel.EXECUTE,
    'SYSTEM': PermissionLevel.ADMIN,
  };

  /**
   * Checks if a user has the required permission for a resource
   */
  async hasPermission(
    userId: string,
    resourceType: ResourceType,
    resourceId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    try {
      // Get user with their roles
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } },
      });

      if (!user) {
        logger.warn(`Permission check failed: User ${userId} not found`);
        return false;
      }

      // Check user-specific permissions first
      const userPermission = await prisma.userPermission.findFirst({
        where: {
          userId,
          resourceType,
          resourceId,
        },
      });

      if (userPermission) {
        return this.isLevelSufficient(userPermission.level as PermissionLevel, requiredLevel);
      }

      // Check role-based permissions
      const roleNames = user.roles.map(userRole => userRole.role.name);
      
      // Admin role has full access
      if (roleNames.includes('admin')) {
        return true;
      }

      // Check if any of the user's roles have the required permission
      for (const roleName of roleNames) {
        const rolePermissions = this.defaultRolePermissions[roleName] || [];
        
        for (const permission of rolePermissions) {
          // Check for exact resource match or wildcard
          if (
            (permission.resourceType === resourceType && 
             (permission.resourceId === resourceId || permission.resourceId === '*')) &&
            this.isLevelSufficient(permission.level, requiredLevel)
          ) {
            return true;
          }
          
          // Check for category-wide permissions with wildcards
          if (
            permission.resourceType === resourceType && 
            permission.resourceId === '*' &&
            this.isLevelSufficient(permission.level, requiredLevel)
          ) {
            return true;
          }
          
          // Special case for "own" resources (user-owned resources)
          if (
            permission.resourceType === resourceType && 
            permission.resourceId === 'own'
          ) {
            // Check if the resource belongs to the user
            const ownedResource = await this.isResourceOwnedByUser(resourceType, resourceId, userId);
            if (ownedResource && this.isLevelSufficient(permission.level, requiredLevel)) {
              return true;
            }
          }
        }
      }

      logger.info(`Permission denied: User ${userId} doesn't have ${requiredLevel} access to ${resourceType}:${resourceId}`);
      return false;
    } catch (error) {
      logger.error('Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Checks if a user has permission to use a specific tool
   */
  async canUseTool(userId: string, tool: Tool): Promise<boolean> {
    // First check if tool is of a type that requires special permission
    const requiredLevel = this.toolTypePermissions[tool.type] || PermissionLevel.EXECUTE;
    
    return this.hasPermission(userId, ResourceType.TOOL, tool.id, requiredLevel);
  }

  /**
   * Checks if the permission level is sufficient for the required level
   */
  private isLevelSufficient(granted: PermissionLevel, required: PermissionLevel): boolean {
    const levelOrder = [
      PermissionLevel.NONE,
      PermissionLevel.READ,
      PermissionLevel.EXECUTE,
      PermissionLevel.WRITE,
      PermissionLevel.ADMIN,
    ];
    
    const grantedIndex = levelOrder.indexOf(granted);
    const requiredIndex = levelOrder.indexOf(required);
    
    return grantedIndex >= requiredIndex;
  }

  /**
   * Checks if a resource is owned by the specified user
   */
  private async isResourceOwnedByUser(
    resourceType: ResourceType,
    resourceId: string,
    userId: string
  ): Promise<boolean> {
    try {
      switch (resourceType) {
        case ResourceType.WORKSPACE:
          const workspace = await prisma.workspace.findUnique({
            where: { id: resourceId },
          });
          return workspace?.userId === userId;
          
        case ResourceType.FILE:
          // This would depend on your file model implementation
          // For now, just check if file exists in user's workspace
          const userWorkspaces = await prisma.workspace.findMany({
            where: { userId },
            select: { id: true },
          });
          
          const workspaceIds = userWorkspaces.map(w => w.id);
          
          const document = await prisma.document.findFirst({
            where: {
              id: resourceId,
              OR: [
                { userId },
                { workspaceId: { in: workspaceIds } }
              ]
            }
          });
          
          return !!document;
          
        case ResourceType.DEPLOYMENT:
          const space = await prisma.space.findUnique({
            where: { id: resourceId },
          });
          return space?.userId === userId;
          
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Error checking resource ownership for ${resourceType}:${resourceId}:`, error);
      return false;
    }
  }

  /**
   * Grants a permission to a user
   */
  async grantPermission(
    userId: string,
    resourceType: ResourceType,
    resourceId: string,
    level: PermissionLevel,
    grantedBy?: string,
    conditions?: PermissionCondition[]
  ): Promise<boolean> {
    try {
      await prisma.userPermission.upsert({
        where: {
          userId_resourceType_resourceId: {
            userId,
            resourceType,
            resourceId,
          },
        },
        update: {
          level,
          conditions: conditions ? JSON.stringify(conditions) : null,
          grantedBy,
          updatedAt: new Date(),
        },
        create: {
          userId,
          resourceType,
          resourceId,
          level,
          conditions: conditions ? JSON.stringify(conditions) : null,
          grantedBy,
        },
      });
      
      logger.info(`Permission granted: ${level} access to ${resourceType}:${resourceId} for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error granting permission:', error);
      return false;
    }
  }

  /**
   * Revokes a permission from a user
   */
  async revokePermission(
    userId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> {
    try {
      await prisma.userPermission.delete({
        where: {
          userId_resourceType_resourceId: {
            userId,
            resourceType,
            resourceId,
          },
        },
      });
      
      logger.info(`Permission revoked: Access to ${resourceType}:${resourceId} for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error revoking permission:', error);
      return false;
    }
  }

  /**
   * Updates the permission schema in the database
   * This can be used to migrate or update the permission system
   */
  async updatePermissionSchema(): Promise<boolean> {
    try {
      // For each default role, ensure the permissions exist in the database
      for (const [roleName, permissions] of Object.entries(this.defaultRolePermissions)) {
        const role = await prisma.role.findUnique({
          where: { name: roleName },
        });
        
        if (!role) {
          logger.info(`Creating role: ${roleName}`);
          const newRole = await prisma.role.create({
            data: { name: roleName },
          });
          
          // Ensure each permission is set for the role
          for (const permission of permissions) {
            await prisma.rolePermission.upsert({
              where: {
                roleId_resourceType_resourceId: {
                  roleId: newRole.id,
                  resourceType: permission.resourceType,
                  resourceId: permission.resourceId,
                },
              },
              update: {
                level: permission.level,
              },
              create: {
                roleId: newRole.id,
                resourceType: permission.resourceType,
                resourceId: permission.resourceId,
                level: permission.level,
              },
            });
          }
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error updating permission schema:', error);
      return false;
    }
  }
}

export default new PermissionManager();
