/**
 * Model Context Protocol (MCP) Server Implementation
 * Provides a standardized interface for AI models to interact with tools
 */

import { ToolRegistry } from './registry';
import { CallToolRequest, CallToolResponse, ContentItem, ListToolsResponse, ListToolsRequest } from './types';

/**
 * MCP Server implementation for handling tool discovery and execution
 */
export class MCPServer {
  private toolRegistry: ToolRegistry;
  
  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }
  
  /**
   * Handle request to list available tools
   */
  public async handleListToolsRequest(request?: ListToolsRequest): Promise<ListToolsResponse> {
    return await this.toolRegistry.listTools(request);
  }
  
  /**
   * Handle request to call a tool
   */
  public async handleCallToolRequest(request: CallToolRequest): Promise<CallToolResponse> {
    try {
      const result = await this.toolRegistry.executeTool(request);
      
      // Convert string content to ContentItem array if needed
      const content: ContentItem[] = Array.isArray(result.content) 
        ? result.content 
        : [{ type: 'text', text: result.content as string }];
      
      return {
        content,
        isError: result.isError || false,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('Error in MCP server handling call tool request:', error);
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true
      };
    }
  }
}

/**
 * Create and initialize the MCP server with the tool registry
 */
export function createMCPServer(): MCPServer {
  const toolRegistry = ToolRegistry.getInstance();
  return new MCPServer(toolRegistry);
}
