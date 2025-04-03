/**
 * Deployment Tool for Multi-RoleAI
 * Provides functionality for deploying web applications, managing containers, and domains
 */

import { Tool, ToolType, ToolCapability, ToolResponse } from './types';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DeploymentTool extends Tool {
  createSpace: (name: string, description: string, repoUrl?: string) => Promise<SpaceInfo>;
  deployToSpace: (spaceId: string, sourcePath: string, buildCommand?: string) => Promise<DeploymentResult>;
  getSpaceLogs: (spaceId: string, lines?: number) => Promise<string[]>;
  listSpaces: () => Promise<SpaceInfo[]>;
  getSpaceInfo: (spaceId: string) => Promise<SpaceInfo>;
  updateSpaceConfig: (spaceId: string, config: SpaceConfig) => Promise<boolean>;
  setCustomDomain: (spaceId: string, domain: string) => Promise<boolean>;
  restartSpace: (spaceId: string) => Promise<boolean>;
  deleteSpace: (spaceId: string) => Promise<boolean>;
}

export interface SpaceInfo {
  id: string;
  name: string;
  description: string;
  status: SpaceStatus;
  url: string;
  customDomain?: string;
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastDeployment?: DeploymentResult;
  config: SpaceConfig;
}

export interface SpaceConfig {
  env: Record<string, string>;
  resources: {
    cpu: string;
    memory: string;
    storage: string;
  };
  buildCommand?: string;
  startCommand?: string;
  framework?: string;
  port: number;
  autoScaling?: boolean;
}

export interface DeploymentResult {
  id: string;
  spaceId: string;
  status: DeploymentStatus;
  startedAt: string;
  completedAt?: string;
  logs: string[];
  error?: string;
  containerId?: string;
}

export enum SpaceStatus {
  CREATING = 'creating',
  RUNNING = 'running',
  STOPPED = 'stopped',
  FAILED = 'failed',
  DEPLOYING = 'deploying'
}

export enum DeploymentStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  DEPLOYING = 'deploying',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Creates and returns an instance of the DeploymentTool
 */
export function getDeploymentTool(): DeploymentTool {
  const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
  const spacesPath = path.join(storagePath, 'spaces');
  const deploymentsPath = path.join(storagePath, 'deployments');
  const containerBasePath = path.join(storagePath, 'containers');
  
  // Ensure storage directories exist
  (async () => {
    try {
      await fs.mkdir(spacesPath, { recursive: true });
      await fs.mkdir(deploymentsPath, { recursive: true });
      await fs.mkdir(containerBasePath, { recursive: true });
    } catch (error) {
      console.error('Error creating deployment storage directories:', error instanceof Error ? error.message : String(error));
    }
  })();

  // Default space configuration
  const defaultSpaceConfig: SpaceConfig = {
    env: {},
    resources: {
      cpu: '0.5',
      memory: '1G',
      storage: '5G'
    },
    port: 3000,
    autoScaling: false
  };

  return {
    id: 'deployment',
    name: 'Deployment Tool',
    description: 'Tool for deploying and managing web applications',
    type: ToolType.DEPLOYMENT,
    capabilities: [
      ToolCapability.CONTAINER_MANAGEMENT,
      ToolCapability.DOMAIN_MANAGEMENT,
      ToolCapability.MONITORING
    ],
    
    // Add the required properties to satisfy the Tool interface
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: [
            'createSpace',
            'deployToSpace',
            'getSpaceLogs',
            'listSpaces',
            'getSpaceInfo',
            'updateSpaceConfig',
            'setCustomDomain',
            'restartSpace',
            'deleteSpace'
          ]
        },
        name: { type: 'string' },
        description: { type: 'string' },
        repoUrl: { type: 'string' },
        spaceId: { type: 'string' },
        sourcePath: { type: 'string' },
        buildCommand: { type: 'string' },
        lines: { type: 'number' },
        config: { type: 'object' },
        domain: { type: 'string' }
      },
      required: ['action']
    },
    
    /**
     * Check if the tool is available
     */
    async isAvailable(): Promise<boolean> {
      try {
        // Check if required directories exist
        await fs.access(storagePath);
        return true;
      } catch (error) {
        console.error('Deployment tool not available:', error instanceof Error ? error.message : String(error));
        return false;
      }
    },
    
    /**
     * Execute the deployment tool based on the provided action
     */
    async execute(params: any): Promise<ToolResponse> {
      try {
        const { action, ...actionParams } = params;
        
        switch (action) {
          case 'createSpace':
            const space = await this.createSpace(
              actionParams.name,
              actionParams.description,
              actionParams.repoUrl
            );
            return { 
              content: JSON.stringify(space),
              metadata: { type: 'space_info' }
            };
            
          case 'deployToSpace':
            const deployment = await this.deployToSpace(
              actionParams.spaceId,
              actionParams.sourcePath,
              actionParams.buildCommand
            );
            return { 
              content: JSON.stringify(deployment),
              metadata: { type: 'deployment_result' }
            };
            
          case 'getSpaceLogs':
            const logs = await this.getSpaceLogs(
              actionParams.spaceId,
              actionParams.lines
            );
            return { 
              content: logs.join('\n'),
              metadata: { type: 'logs' }
            };
            
          case 'listSpaces':
            const spaces = await this.listSpaces();
            return { 
              content: JSON.stringify(spaces),
              metadata: { type: 'space_list' }
            };
            
          case 'getSpaceInfo':
            const spaceInfo = await this.getSpaceInfo(actionParams.spaceId);
            return { 
              content: JSON.stringify(spaceInfo),
              metadata: { type: 'space_info' }
            };
            
          case 'updateSpaceConfig':
            const configUpdated = await this.updateSpaceConfig(
              actionParams.spaceId,
              actionParams.config
            );
            return { 
              content: JSON.stringify({ success: configUpdated }),
              metadata: { type: 'operation_result' }
            };
            
          case 'setCustomDomain':
            const domainSet = await this.setCustomDomain(
              actionParams.spaceId,
              actionParams.domain
            );
            return { 
              content: JSON.stringify({ success: domainSet }),
              metadata: { type: 'operation_result' }
            };
            
          case 'restartSpace':
            const restarted = await this.restartSpace(actionParams.spaceId);
            return { 
              content: JSON.stringify({ success: restarted }),
              metadata: { type: 'operation_result' }
            };
            
          case 'deleteSpace':
            const deleted = await this.deleteSpace(actionParams.spaceId);
            return { 
              content: JSON.stringify({ success: deleted }),
              metadata: { type: 'operation_result' }
            };
            
          default:
            return {
              content: `Unknown action: ${action}`,
              isError: true
            };
        }
      } catch (error) {
        console.error('Error executing deployment tool:', error instanceof Error ? error.message : String(error));
        return {
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
          isError: true
        };
      }
    },
    
    /**
     * Creates a new Space for deploying applications
     */
    async createSpace(name: string, description: string, repoUrl?: string) {
      try {
        const spaceId = uuidv4();
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        const spaceContainerPath = path.join(containerBasePath, spaceId);
        
        // Create space container directory
        await fs.mkdir(spaceContainerPath, { recursive: true });
        
        // Generate a subdomain for the space
        const spaceDomain = `${spaceId.substring(0, 8)}.multiroleai.app`;
        
        // Create space metadata
        const space: SpaceInfo = {
          id: spaceId,
          name,
          description,
          status: SpaceStatus.CREATING,
          url: `https://${spaceDomain}`,
          repoUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          config: { ...defaultSpaceConfig }
        };
        
        // Save space metadata
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        // In a real implementation, this would:
        // 1. Provision a container
        // 2. Set up networking
        // 3. Configure reverse proxy
        
        // Update space status to STOPPED (since there's no deployment yet)
        space.status = SpaceStatus.STOPPED;
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        return space;
      } catch (error) {
        console.error('Error creating space:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to create space: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Deploys code to a Space
     */
    async deployToSpace(spaceId: string, sourcePath: string, buildCommand?: string) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // Read space metadata
        const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
        const space = JSON.parse(spaceContent) as SpaceInfo;
        
        // Create deployment ID
        const deploymentId = uuidv4();
        const deploymentPath = path.join(deploymentsPath, `${deploymentId}.json`);
        const spaceContainerPath = path.join(containerBasePath, spaceId);
        
        // Create deployment object
        const deployment: DeploymentResult = {
          id: deploymentId,
          spaceId,
          status: DeploymentStatus.PENDING,
          startedAt: new Date().toISOString(),
          logs: []
        };
        
        // Save initial deployment
        await fs.writeFile(deploymentPath, JSON.stringify(deployment, null, 2));
        
        // Update space status
        space.status = SpaceStatus.DEPLOYING;
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        // In a real implementation, this would:
        // 1. Clone or copy source code to the container directory
        // 2. Run build command
        // 3. Start the application
        // 4. Configure networking
        
        // Simulate copying source code
        deployment.logs.push(`[${new Date().toISOString()}] Copying source code from ${sourcePath} to container`);
        deployment.status = DeploymentStatus.BUILDING;
        await fs.writeFile(deploymentPath, JSON.stringify(deployment, null, 2));
        
        // Simulate running build command if provided
        if (buildCommand) {
          deployment.logs.push(`[${new Date().toISOString()}] Running build command: ${buildCommand}`);
          // In a real implementation, this would run the actual build command in the container
          deployment.logs.push(`[${new Date().toISOString()}] Build completed successfully`);
        }
        
        // Simulate deployment
        deployment.logs.push(`[${new Date().toISOString()}] Starting application deployment`);
        deployment.status = DeploymentStatus.DEPLOYING;
        await fs.writeFile(deploymentPath, JSON.stringify(deployment, null, 2));
        
        // Simulate successful deployment
        deployment.logs.push(`[${new Date().toISOString()}] Application deployed successfully`);
        deployment.status = DeploymentStatus.COMPLETED;
        deployment.completedAt = new Date().toISOString();
        deployment.containerId = `container-${spaceId}-${deploymentId.substring(0, 8)}`;
        await fs.writeFile(deploymentPath, JSON.stringify(deployment, null, 2));
        
        // Update space with deployment information
        space.status = SpaceStatus.RUNNING;
        space.lastDeployment = deployment;
        space.updatedAt = new Date().toISOString();
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        return deployment;
      } catch (error) {
        console.error('Error deploying to space:', error instanceof Error ? error.message : String(error));
        
        // Update deployment with error
        try {
          const deploymentId = uuidv4(); // Use a new ID if we failed before creating one
          const deploymentPath = path.join(deploymentsPath, `${deploymentId}.json`);
          
          const deployment: DeploymentResult = {
            id: deploymentId,
            spaceId,
            status: DeploymentStatus.FAILED,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            logs: [`[${new Date().toISOString()}] Deployment failed`],
            error: error instanceof Error ? error.message : String(error)
          };
          
          await fs.writeFile(deploymentPath, JSON.stringify(deployment, null, 2));
          
          // Update space status
          const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
          const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
          const space = JSON.parse(spaceContent) as SpaceInfo;
          
          space.status = SpaceStatus.FAILED;
          space.lastDeployment = deployment;
          space.updatedAt = new Date().toISOString();
          
          await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
          
          return deployment;
        } catch (secondaryError) {
          console.error('Error updating deployment with failure:', secondaryError instanceof Error ? secondaryError.message : String(secondaryError));
        }
        
        throw new Error(`Failed to deploy to space: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Gets logs for a deployed Space
     */
    async getSpaceLogs(spaceId: string, lines: number = 100) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // Read space metadata
        const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
        const space = JSON.parse(spaceContent) as SpaceInfo;
        
        // Get last deployment
        if (!space.lastDeployment) {
          return ['No deployments found for this space'];
        }
        
        // In a real implementation, we would fetch logs from the container
        // For this simulation, return the deployment logs
        return space.lastDeployment.logs;
      } catch (error) {
        console.error('Error getting space logs:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to get space logs: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Lists all Spaces
     */
    async listSpaces() {
      try {
        const spaces: SpaceInfo[] = [];
        
        // List all space files
        const files = await fs.readdir(spacesPath);
        
        // Process each file
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          
          const spacePath = path.join(spacesPath, file);
          const spaceContent = await fs.readFile(spacePath, 'utf-8');
          const space = JSON.parse(spaceContent) as SpaceInfo;
          
          spaces.push(space);
        }
        
        // Sort spaces by creation date (newest first)
        spaces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return spaces;
      } catch (error) {
        console.error('Error listing spaces:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to list spaces: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Gets information about a Space
     */
    async getSpaceInfo(spaceId: string) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // Read space metadata
        const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
        const space = JSON.parse(spaceContent) as SpaceInfo;
        
        return space;
      } catch (error) {
        console.error('Error getting space info:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to get space info: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Updates Space configuration
     */
    async updateSpaceConfig(spaceId: string, config: SpaceConfig) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // Read space metadata
        const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
        const space = JSON.parse(spaceContent) as SpaceInfo;
        
        // Update configuration
        space.config = {
          ...space.config,
          ...config
        };
        space.updatedAt = new Date().toISOString();
        
        // Save updated space metadata
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        // In a real implementation, this would:
        // 1. Update container configuration
        // 2. Apply changes to running container
        
        return true;
      } catch (error) {
        console.error('Error updating space config:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to update space config: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Sets a custom domain for a Space
     */
    async setCustomDomain(spaceId: string, domain: string) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // Read space metadata
        const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
        const space = JSON.parse(spaceContent) as SpaceInfo;
        
        // Update custom domain
        space.customDomain = domain;
        space.updatedAt = new Date().toISOString();
        
        // Save updated space metadata
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        // In a real implementation, this would:
        // 1. Verify domain ownership
        // 2. Configure DNS
        // 3. Set up SSL certificate
        // 4. Update reverse proxy configuration
        
        return true;
      } catch (error) {
        console.error('Error setting custom domain:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to set custom domain: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Restarts a Space
     */
    async restartSpace(spaceId: string) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // Read space metadata
        const spaceContent = await fs.readFile(spaceMetadataPath, 'utf-8');
        const space = JSON.parse(spaceContent) as SpaceInfo;
        
        // Check if space has been deployed
        if (!space.lastDeployment) {
          throw new Error('Space has not been deployed yet');
        }
        
        // In a real implementation, this would:
        // 1. Restart the container
        // 2. Verify application is running
        
        // Update space status
        space.status = SpaceStatus.RUNNING;
        space.updatedAt = new Date().toISOString();
        
        // Save updated space metadata
        await fs.writeFile(spaceMetadataPath, JSON.stringify(space, null, 2));
        
        return true;
      } catch (error) {
        console.error('Error restarting space:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to restart space: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Deletes a Space
     */
    async deleteSpace(spaceId: string) {
      try {
        const spaceMetadataPath = path.join(spacesPath, `${spaceId}.json`);
        const spaceContainerPath = path.join(containerBasePath, spaceId);
        
        // Check if space exists
        try {
          await fs.access(spaceMetadataPath);
        } catch {
          throw new Error(`Space with ID ${spaceId} not found`);
        }
        
        // In a real implementation, this would:
        // 1. Stop and remove the container
        // 2. Remove DNS configuration
        // 3. Clean up storage
        
        // Delete space container directory
        try {
          await fs.rm(spaceContainerPath, { recursive: true, force: true });
        } catch (error) {
          console.warn(`Error deleting space container directory: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Delete space metadata
        await fs.unlink(spaceMetadataPath);
        
        return true;
      } catch (error) {
        console.error('Error deleting space:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to delete space: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
}
