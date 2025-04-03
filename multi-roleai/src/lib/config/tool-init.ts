/**
 * Tool system initialization for Multi-RoleAI
 * This module initializes all tools and makes them available throughout the application
 */

import { initializeToolSystem, toolRegistry, mcpServer } from '../tools';
import { WebBrowserTool, getWebBrowserTool } from '../tools/web-browser';
import { CodeExecutionTool, getCodeExecutionTool } from '../tools/code-execution';
import { FileSystemTool, getFileSystemTool } from '../tools/file-system';

/**
 * Initialize the entire tool system on application startup
 */
export function initializeTools() {
  console.log('Initializing Multi-RoleAI tool system...');
  
  try {
    // Initialize the tool system
    const { toolRegistry, mcpServer } = initializeToolSystem();
    
    // Log the registered tools
    toolRegistry.listTools().then(response => {
      console.log(`Successfully initialized ${response.tools.length} tools:`);
      response.tools.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });
    });
    
    return { toolRegistry, mcpServer };
  } catch (error) {
    console.error('Failed to initialize tool system:', error);
    throw error;
  }
}

/**
 * Get the global tool registry instance
 */
export function getToolRegistry() {
  return toolRegistry;
}

/**
 * Get the global MCP server instance
 */
export function getMCPServer() {
  return mcpServer;
}

// Export the tool system components
export { toolRegistry, mcpServer };
