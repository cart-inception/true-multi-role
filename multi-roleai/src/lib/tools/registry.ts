/**
 * Tool Registry implementation for Multi-RoleAI
 */

import { Tool, ToolType, ToolCapability, ToolResponse, ListToolsResponse, ListToolsRequest, CallToolRequest } from './types';

/**
 * Manages tool registration, discovery, and execution
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private static instance: ToolRegistry;

  /**
   * Get the singleton instance of the ToolRegistry
   */
  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Register a tool with the registry
   */
  public registerTool(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`Tool with id ${tool.id} already exists. Overwriting.`);
    }
    this.tools.set(tool.id, tool);
  }

  /**
   * Unregister a tool from the registry
   */
  public unregisterTool(id: string): boolean {
    return this.tools.delete(id);
  }

  /**
   * Get a specific tool by id
   */
  public getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  /**
   * List all available tools, optionally filtered by type and capabilities
   */
  public async listTools(request?: ListToolsRequest): Promise<ListToolsResponse> {
    const availableTools: Tool[] = [];
    
    for (const tool of this.tools.values()) {
      // Filter by tool type if specified
      if (request?.filter?.type && tool.type !== request.filter.type) {
        continue;
      }
      
      // Filter by tool capabilities if specified
      if (request?.filter?.capabilities && request.filter.capabilities.length > 0) {
        const hasAllCapabilities = request.filter.capabilities.every(
          capability => tool.capabilities.includes(capability)
        );
        if (!hasAllCapabilities) {
          continue;
        }
      }
      
      availableTools.push(tool);
    }
    
    return { tools: availableTools };
  }

  /**
   * Execute a tool with the given parameters
   */
  public async executeTool(request: CallToolRequest): Promise<ToolResponse> {
    const { toolId, action, parameters } = request;
    const tool = this.tools.get(toolId);
    
    if (!tool) {
      return {
        content: `Error: Tool not found: ${toolId}`,
        isError: true
      };
    }
    
    try {
      // Check if the tool has the requested action
      if (typeof (tool as any)[action] !== 'function') {
        return {
          content: `Error: Action not supported: ${action}`,
          isError: true
        };
      }
      
      // Call the action with the provided parameters
      const result = await (tool as any)[action](parameters);
      
      return {
        content: result,
        isError: false
      };
    } catch (error) {
      console.error(`Error executing tool ${toolId}:`, error);
      return {
        content: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
        isError: true
      };
    }
  }
}

/**
 * Create and initialize the global tool registry
 */
export function initializeToolRegistry(): ToolRegistry {
  const registry = ToolRegistry.getInstance();
  return registry;
}
