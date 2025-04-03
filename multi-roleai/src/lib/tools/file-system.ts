/**
 * File System Tool Implementation
 * Provides AI agents with the ability to interact with the file system
 */
import { Tool, ToolResponse, ToolType, ToolCapability } from './types';
import path from 'path';

/**
 * File System Tool for AI agents
 * This provides controlled access to a designated storage area
 */
export class FileSystemTool implements Tool {
  id = 'file-system';
  name = 'File System Tool';
  description = 'Create, read, update, and delete files in the workspace storage area';
  type = ToolType.FILE_SYSTEM;
  capabilities = [
    ToolCapability.FILE_READ,
    ToolCapability.FILE_WRITE,
    ToolCapability.FILE_DELETE
  ];
  
  // Base storage path - should be configured from environment variables
  private basePath: string;
  
  constructor(basePath?: string) {
    // Use the provided path or default to the STORAGE_PATH environment variable
    // Fallback to a local 'storage' directory if not set
    this.basePath = basePath || process.env.STORAGE_PATH || './storage';
  }
  
  inputSchema = {
    type: 'object',
    properties: {
      action: { 
        type: 'string',
        enum: ['read', 'write', 'append', 'delete', 'list', 'exists', 'mkdir']
      },
      path: { 
        type: 'string' 
      },
      content: { 
        type: 'string' 
      },
      encoding: {
        type: 'string',
        enum: ['utf8', 'base64', 'binary'],
        default: 'utf8'
      }
    },
    required: ['action', 'path']
  };
  
  /**
   * Check if the tool is available
   */
  async isAvailable(): Promise<boolean> {
    // Check if the storage directory exists and is accessible
    // For demonstration purposes, we'll just return true
    return true;
  }
  
  /**
   * Execute the file system operation
   */
  async execute(params: any): Promise<ToolResponse> {
    // This is a simplified implementation
    try {
      const { action, path: filePath } = params;
      
      // Ensure the path is within the allowed storage area
      const normalizedPath = this.normalizePath(filePath);
      
      if (!this.isPathSafe(normalizedPath)) {
        return {
          content: `Error: Path ${filePath} is outside the allowed storage area`,
          isError: true
        };
      }
      
      // Mock implementation for demonstration purposes
      switch (action) {
        case 'read':
          return this.mockReadFile(normalizedPath);
          
        case 'write':
          if (!params.content) {
            return {
              content: 'Error: Content is required for write action',
              isError: true
            };
          }
          return this.mockWriteFile(normalizedPath, params.content);
          
        case 'append':
          if (!params.content) {
            return {
              content: 'Error: Content is required for append action',
              isError: true
            };
          }
          return this.mockAppendFile(normalizedPath, params.content);
          
        case 'delete':
          return this.mockDeleteFile(normalizedPath);
          
        case 'list':
          return this.mockListDirectory(normalizedPath);
          
        case 'exists':
          return this.mockFileExists(normalizedPath);
          
        case 'mkdir':
          return this.mockMakeDirectory(normalizedPath);
          
        default:
          return {
            content: `Error: Unknown action ${action}`,
            isError: true
          };
      }
    } catch (error) {
      console.error('Error in file system tool:', error);
      return {
        content: `Error executing file system operation: ${error instanceof Error ? error.message : String(error)}`,
        isError: true
      };
    }
  }
  
  /**
   * Normalize the file path to prevent path traversal attacks
   */
  private normalizePath(filePath: string): string {
    // Remove any '..' path traversal attempts
    const normalizedPath = path.normalize(filePath)
      .replace(/^(\.\.(\/|\\|$))+/, '');
      
    return path.join(this.basePath, normalizedPath);
  }
  
  /**
   * Check if the path is within the allowed storage area
   */
  private isPathSafe(normalizedPath: string): boolean {
    return normalizedPath.startsWith(this.basePath);
  }
  
  // Mock implementations for file operations
  // In a real implementation, these would use the fs module
  
  private mockReadFile(filePath: string): ToolResponse {
    return {
      content: `Content of file ${filePath}`,
      metadata: {
        path: filePath,
        size: 1024,
        modified: new Date().toISOString()
      }
    };
  }
  
  private mockWriteFile(filePath: string, content: string): ToolResponse {
    return {
      content: `Successfully wrote to file ${filePath}`,
      metadata: {
        path: filePath,
        size: content.length,
        modified: new Date().toISOString()
      }
    };
  }
  
  private mockAppendFile(filePath: string, content: string): ToolResponse {
    return {
      content: `Successfully appended to file ${filePath}`,
      metadata: {
        path: filePath,
        appendedSize: content.length,
        modified: new Date().toISOString()
      }
    };
  }
  
  private mockDeleteFile(filePath: string): ToolResponse {
    return {
      content: `Successfully deleted file ${filePath}`,
      metadata: {
        path: filePath,
        deleted: true
      }
    };
  }
  
  private mockListDirectory(dirPath: string): ToolResponse {
    return {
      content: [
        { type: 'text', text: `Contents of directory ${dirPath}:` },
        { 
          type: 'table', 
          data: {
            headers: ['Name', 'Type', 'Size', 'Modified'],
            rows: [
              ['file1.txt', 'file', '1024 bytes', new Date().toISOString()],
              ['file2.md', 'file', '2048 bytes', new Date().toISOString()],
              ['subfolder', 'directory', '', new Date().toISOString()]
            ]
          }
        }
      ],
      metadata: {
        path: dirPath,
        items: 3
      }
    };
  }
  
  private mockFileExists(filePath: string): ToolResponse {
    return {
      content: `File ${filePath} exists`,
      metadata: {
        path: filePath,
        exists: true,
        isFile: true
      }
    };
  }
  
  private mockMakeDirectory(dirPath: string): ToolResponse {
    return {
      content: `Successfully created directory ${dirPath}`,
      metadata: {
        path: dirPath,
        created: true
      }
    };
  }
}

// Singleton instance for convenience
let _instance: FileSystemTool | null = null;

/**
 * Get the singleton instance of the FileSystemTool
 */
export function getFileSystemTool(): FileSystemTool {
  if (!_instance) {
    _instance = new FileSystemTool();
  }
  return _instance;
}
