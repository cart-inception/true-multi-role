/**
 * Tool Integration System for Multi-RoleAI
 * Exports all tools and provides initialization functions
 */

import { ToolRegistry } from './registry';
import { MCPServer, createMCPServer } from './mcp-server';
import { WebBrowserTool, getWebBrowserTool } from './web-browser';
import { CodeExecutionTool, getCodeExecutionTool } from './code-execution';
import { FileSystemTool, getFileSystemTool } from './file-system';
import { ImageProcessingTool, getImageProcessingTool } from './image-processing';
import { DataVisualizationTool, getDataVisualizationTool } from './data-visualization';
import { DocumentAnalysisTool, getDocumentAnalysisTool } from './document-analysis';
import { RichTextEditorTool, getRichTextEditorTool } from './rich-text-editor';
import { DocumentCollaborationTool, getDocumentCollaborationTool } from './document-collaboration';
import { DeploymentTool, getDeploymentTool } from './deployment';

// Export types
export * from './types';
export * from './registry';
export * from './mcp-server';

// Export individual tools
export { getWebBrowserTool } from './web-browser';
export { getCodeExecutionTool } from './code-execution';
export { getFileSystemTool } from './file-system';
export { getImageProcessingTool } from './image-processing';
export { getDataVisualizationTool } from './data-visualization';
export { getDocumentAnalysisTool } from './document-analysis';
export { getRichTextEditorTool } from './rich-text-editor';
export { getDocumentCollaborationTool } from './document-collaboration';
export { getDeploymentTool } from './deployment';

// Export tool types
export type { WebBrowserTool } from './web-browser';
export type { CodeExecutionTool } from './code-execution';
export type { FileSystemTool } from './file-system';
export type { ImageProcessingTool } from './image-processing';
export type { DataVisualizationTool } from './data-visualization';
export type { DocumentAnalysisTool } from './document-analysis';
export type { RichTextEditorTool } from './rich-text-editor';
export type { DocumentCollaborationTool } from './document-collaboration';
export type { DeploymentTool } from './deployment';

/**
 * Initialize the entire tool system and register all available tools
 */
export function initializeToolSystem(): {
  toolRegistry: ToolRegistry;
  mcpServer: MCPServer;
} {
  // Get the tool registry instance
  const toolRegistry = ToolRegistry.getInstance();
  
  // Register all tools
  toolRegistry.registerTool(getWebBrowserTool());
  toolRegistry.registerTool(getCodeExecutionTool());
  toolRegistry.registerTool(getFileSystemTool());
  
  // Register multi-modal tools
  toolRegistry.registerTool(getImageProcessingTool());
  toolRegistry.registerTool(getDataVisualizationTool());
  toolRegistry.registerTool(getDocumentAnalysisTool());
  
  // Register document management tools
  toolRegistry.registerTool(getRichTextEditorTool());
  toolRegistry.registerTool(getDocumentCollaborationTool());
  
  // Register deployment tools
  toolRegistry.registerTool(getDeploymentTool());
  
  // Create the MCP server
  const mcpServer = createMCPServer();
  
  return {
    toolRegistry,
    mcpServer
  };
}

// Initialize the tool system when this module is imported
// This ensures all tools are registered and available
const { toolRegistry, mcpServer } = initializeToolSystem();

// Export for use in other modules
export { toolRegistry, mcpServer };
