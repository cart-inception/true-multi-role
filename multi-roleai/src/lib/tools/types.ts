/**
 * Type definitions for the tool integration system
 */

/**
 * Enum for tool types to categorize tools
 */
export enum ToolType {
  WEB_BROWSING = 'web_browsing',
  CODE_EXECUTION = 'code_execution',
  FILE_SYSTEM = 'file_system',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  DATA_PROCESSING = 'data_processing',
  MULTI_MODAL = 'multi_modal',
  DEPLOYMENT = 'deployment'
}

/**
 * Enum for tool capabilities
 */
export enum ToolCapability {
  // Web browsing capabilities
  WEB_SEARCH = 'web_search',
  WEB_SCRAPING = 'web_scraping',
  
  // Code execution capabilities
  CODE_EXECUTION = 'code_execution',
  CODE_ANALYSIS = 'code_analysis',
  
  // File system capabilities
  FILE_READ = 'file_read',
  FILE_WRITE = 'file_write',
  FILE_DELETE = 'file_delete',
  
  // Multi-modal capabilities
  IMAGE_ANALYSIS = 'image_analysis',
  IMAGE_GENERATION = 'image_generation',
  IMAGE_EDITING = 'image_editing',
  DATA_VISUALIZATION = 'data_visualization',
  DATA_PROCESSING = 'data_processing',
  DOCUMENT_ANALYSIS = 'document_analysis',
  TEXT_PROCESSING = 'text_processing',
  
  // Deployment capabilities
  CONTAINER_MANAGEMENT = 'container_management',
  DOMAIN_MANAGEMENT = 'domain_management',
  MONITORING = 'monitoring'
}

/**
 * JSON Schema interface for tool input validation
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Response from a tool execution
 */
export interface ToolResponse {
  content: string | ContentItem[];
  isError?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Content item for structured responses
 */
export interface ContentItem {
  type: 'text' | 'image' | 'code' | 'table' | 'chart' | 'document' | 'visualization';
  text?: string;
  url?: string;
  language?: string;
  data?: any;
  mimeType?: string;
}

/**
 * Information about a tool for discovery
 */
export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  capabilities: ToolCapability[];
}

/**
 * Tool interface that all tools must implement
 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  capabilities: ToolCapability[];
  inputSchema: JSONSchema;
  execute: (params: any) => Promise<ToolResponse>;
  isAvailable: () => Promise<boolean>;
}

/**
 * Request to list available tools
 */
export interface ListToolsRequest {
  filter?: {
    type?: ToolType;
    capabilities?: ToolCapability[];
  }
}

/**
 * Response for tool listing
 */
export interface ListToolsResponse {
  tools: ToolInfo[];
}

/**
 * Request to call a tool
 */
export interface CallToolRequest {
  toolId: string;
  action: string;
  parameters: any;
}

/**
 * Response from a tool call
 */
export interface CallToolResponse {
  content: ContentItem[];
  isError: boolean;
  metadata?: Record<string, any>;
}
