/**
 * Sandboxed Execution Environment for Multi-RoleAI
 * 
 * This module implements a secure sandboxed environment for executing code
 * and tools with controlled access to system resources.
 */

import { spawn, SpawnOptions } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { Tool } from '../lib/tools/types';
import { logger } from '../utils/logger';

// Interface for sandbox configuration
export interface SandboxConfig {
  memoryLimit: number; // Memory limit in MB
  cpuLimit: number; // CPU limit (percentage, e.g. 50 for 0.5 cores)
  timeoutMs: number; // Execution timeout in milliseconds
  networkAccess: boolean; // Whether to allow network access
  allowedCommands?: string[]; // Whitelist of allowed commands
  allowedFilePaths?: string[]; // Whitelist of allowed file paths
  allowedTools?: string[]; // IDs of allowed tools
  volumeMounts?: { [containerPath: string]: string }; // Host path to container path mapping
}

// Default sandbox configuration
export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  memoryLimit: 256, // 256MB
  cpuLimit: 25, // 0.25 cores
  timeoutMs: 30000, // 30 seconds
  networkAccess: false,
  allowedCommands: ['node', 'python3', 'bash'],
  allowedFilePaths: ['/tmp/sandbox'],
  allowedTools: []
};

// Execution result interface
export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTimeMs: number;
  resourceUsage?: {
    memory: number;
    cpu: number;
  };
}

/**
 * SandboxManager handles the creation and management of sandbox environments
 * for secure code execution
 */
export class SandboxManager {
  private docker: Docker;
  private sandboxRootDir: string;
  
  constructor(private config: SandboxConfig = DEFAULT_SANDBOX_CONFIG) {
    this.docker = new Docker();
    this.sandboxRootDir = process.env.SANDBOX_ROOT_DIR || path.join(process.cwd(), 'sandbox');
    
    // Ensure sandbox root directory exists
    this.initializeSandbox().catch(err => {
      logger.error('Failed to initialize sandbox:', err);
    });
  }
  
  private async initializeSandbox(): Promise<void> {
    try {
      await fs.mkdir(this.sandboxRootDir, { recursive: true });
      // Create baseline Docker image for sandboxes if needed
      await this.ensureSandboxImage();
    } catch (error) {
      logger.error('Error initializing sandbox environment:', error);
      throw error;
    }
  }
  
  private async ensureSandboxImage(): Promise<void> {
    try {
      const images = await this.docker.listImages();
      const sandboxImageExists = images.some(img => 
        img.RepoTags && img.RepoTags.includes('multiroleai-sandbox:latest')
      );
      
      if (!sandboxImageExists) {
        logger.info('Building sandbox Docker image...');
        // Implementation would depend on how you want to create the base image
        // This could involve creating a Dockerfile and building it
      }
    } catch (error) {
      logger.error('Error ensuring sandbox image exists:', error);
      throw error;
    }
  }
  
  /**
   * Executes code in a sandboxed environment
   * @param code Code to execute
   * @param language Programming language of the code
   * @param inputData Optional input data for the code
   * @returns Execution result
   */
  async executeCode(
    code: string, 
    language: 'javascript' | 'python' | 'bash', 
    inputData?: string
  ): Promise<ExecutionResult> {
    const sandboxId = uuidv4();
    const sandboxDir = path.join(this.sandboxRootDir, sandboxId);
    
    try {
      // Create sandbox directory
      await fs.mkdir(sandboxDir, { recursive: true });
      
      // Write code to file
      const fileExtensions = {
        javascript: 'js',
        python: 'py',
        bash: 'sh'
      };
      
      const fileName = `code.${fileExtensions[language]}`;
      const filePath = path.join(sandboxDir, fileName);
      await fs.writeFile(filePath, code);
      
      // Write input data if provided
      if (inputData) {
        const inputPath = path.join(sandboxDir, 'input.txt');
        await fs.writeFile(inputPath, inputData);
      }
      
      // Set up container config
      const containerConfig = this.createContainerConfig(sandboxId, language, fileName);
      
      // Execute in container
      const startTime = Date.now();
      const result = await this.runInContainer(containerConfig);
      const executionTimeMs = Date.now() - startTime;
      
      return {
        ...result,
        executionTimeMs
      };
    } catch (error) {
      logger.error(`Sandbox execution failed for ${sandboxId}:`, error);
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTimeMs: 0
      };
    } finally {
      // Clean up sandbox directory
      try {
        await fs.rm(sandboxDir, { recursive: true, force: true });
      } catch (error) {
        logger.error(`Failed to clean up sandbox directory ${sandboxDir}:`, error);
      }
    }
  }
  
  /**
   * Creates container configuration for sandbox execution
   */
  private createContainerConfig(
    sandboxId: string, 
    language: string, 
    fileName: string
  ): Docker.ContainerCreateOptions {
    const commandMap = {
      javascript: ['node', `/sandbox/${fileName}`],
      python: ['python3', `/sandbox/${fileName}`],
      bash: ['bash', `/sandbox/${fileName}`]
    };
    
    return {
      Image: 'multiroleai-sandbox:latest',
      Cmd: commandMap[language as keyof typeof commandMap],
      HostConfig: {
        AutoRemove: true,
        Memory: this.config.memoryLimit * 1024 * 1024,
        MemorySwap: this.config.memoryLimit * 1024 * 1024, // Disable swap
        NanoCpus: this.config.cpuLimit * 1e7, // CPU limit in nano CPUs
        NetworkMode: this.config.networkAccess ? 'bridge' : 'none',
        Binds: [`${path.join(this.sandboxRootDir, sandboxId)}:/sandbox:ro`],
        SecurityOpt: ['no-new-privileges'],
        PidsLimit: 50, // Limit number of processes
        ReadonlyRootfs: true, // Read-only root filesystem
        CapDrop: [
          'ALL'
        ],
      },
      NetworkDisabled: !this.config.networkAccess,
      StopTimeout: Math.ceil(this.config.timeoutMs / 1000),
      Labels: {
        'multiroleai.sandbox': 'true',
        'multiroleai.sandbox.id': sandboxId
      }
    } as Docker.ContainerCreateOptions;
  }
  
  /**
   * Runs a command in a Docker container
   */
  private async runInContainer(containerConfig: Docker.ContainerCreateOptions): Promise<ExecutionResult> {
    const container = await this.docker.createContainer(containerConfig);
    
    try {
      // Start container with timeout
      await container.start();
      
      // Set up timeout
      const timeoutPromise = new Promise<ExecutionResult>((resolve) => {
        setTimeout(() => {
          resolve({
            success: false,
            output: '',
            error: `Execution timed out after ${this.config.timeoutMs}ms`,
            executionTimeMs: this.config.timeoutMs
          });
        }, this.config.timeoutMs);
      });
      
      // Set up execution promise
      const executionPromise = (async (): Promise<ExecutionResult> => {
        // Wait for container to finish
        await container.wait();
        
        // Get logs
        const logs = await container.logs({
          stdout: true,
          stderr: true
        });
        
        const output = logs.toString();
        
        // Get container info to check exit code
        const info = await container.inspect();
        const success = info.State.ExitCode === 0;
        
        return {
          success,
          output,
          error: success ? undefined : 'Execution failed',
          executionTimeMs: 0, // Will be calculated by the caller
          resourceUsage: {
            memory: info.SizeRootFs || 0,
            cpu: 0 // Would need additional monitoring to get accurate CPU usage
          }
        };
      })();
      
      // Race timeout against execution
      return Promise.race([timeoutPromise, executionPromise]);
    } finally {
      // Ensure container is removed
      try {
        await container.remove({ force: true });
      } catch (error) {
        logger.error('Error removing container:', error);
      }
    }
  }
  
  /**
   * Executes a tool in a sandboxed environment
   * @param tool Tool to execute
   * @param params Parameters for tool execution
   * @returns Tool execution result
   */
  async executeTool<T>(tool: Tool, params: any): Promise<T> {
    // Check if tool is allowed
    if (this.config.allowedTools && 
        this.config.allowedTools.length > 0 &&
        !this.config.allowedTools.includes(tool.id)) {
      throw new Error(`Tool ${tool.id} is not allowed in this sandbox`);
    }
    
    // Tool execution happens through the tool's own methods
    // We're just adding security checks here
    
    // Implementation would depend on specific tool interfaces
    // This is a simplified example
    try {
      // Execute the tool with the provided parameters
      const result = await (tool as any)(params);
      return result as T;
    } catch (error) {
      logger.error(`Error executing tool ${tool.id} in sandbox:`, error);
      throw error;
    }
  }
  
  /**
   * Validates if a command is allowed to run in the sandbox
   */
  isCommandAllowed(command: string): boolean {
    if (!this.config.allowedCommands || this.config.allowedCommands.length === 0) {
      return false;
    }
    
    const commandName = command.split(' ')[0];
    return this.config.allowedCommands.includes(commandName);
  }
  
  /**
   * Validates if a file path is allowed to be accessed in the sandbox
   */
  isFilePathAllowed(filePath: string): boolean {
    if (!this.config.allowedFilePaths || this.config.allowedFilePaths.length === 0) {
      return false;
    }
    
    return this.config.allowedFilePaths.some(allowedPath => 
      filePath === allowedPath || filePath.startsWith(`${allowedPath}/`)
    );
  }
}

export default new SandboxManager();
