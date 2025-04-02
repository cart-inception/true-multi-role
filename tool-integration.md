# Tool Integration for Multi-RoleAI

## Overview

This document outlines the approach for integrating various tools into the Multi-RoleAI application, enabling AI agents to interact with external systems and perform complex tasks. The tools will be primarily self-hosted on the VPS to maintain control, privacy, and reduce external dependencies.

## Core Principles

1. **Self-Hosted First**: Whenever possible, tools will be self-hosted on the VPS to maintain control and reduce external dependencies.
2. **Secure Execution**: All tool execution will occur in isolated environments to prevent security issues.
3. **Standardized Interface**: Tools will follow a consistent interface pattern for easy integration and maintenance.
4. **Extensibility**: The tool system will be designed to allow for easy addition of new tools.
5. **Observability**: Tool execution will be logged and monitored for debugging and performance optimization.

## Tool Integration Architecture

### 1. Tool Registry System

The Multi-RoleAI app will implement a central Tool Registry that:

- Maintains a catalog of available tools
- Handles tool discovery and registration
- Manages tool permissions and access control
- Provides a unified interface for agents to interact with tools

```typescript
// Tool interface definition
interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  execute: (params: any) => Promise<ToolResponse>;
  isAvailable: () => Promise<boolean>;
}

// Tool registry implementation
class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }
  
  async listTools(): Promise<ToolInfo[]> {
    const availableTools: ToolInfo[] = [];
    
    for (const [name, tool] of this.tools.entries()) {
      if (await tool.isAvailable()) {
        availableTools.push({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        });
      }
    }
    
    return availableTools;
  }
  
  async executeTool(name: string, params: any): Promise<ToolResponse> {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    if (!(await tool.isAvailable())) {
      throw new Error(`Tool is not available: ${name}`);
    }
    
    try {
      return await tool.execute(params);
    } catch (error) {
      return {
        isError: true,
        content: `Error executing tool: ${error.message}`
      };
    }
  }
}
```

### 2. Model Context Protocol Integration

The Multi-RoleAI app will implement the Model Context Protocol (MCP) to provide a standardized way for AI models to interact with tools. This approach offers several advantages:

- Standardized communication between AI models and tools
- Improved tool discovery and usage
- Enhanced security through structured interfaces
- Better error handling and reporting

```typescript
// MCP Server implementation
class MCPServer {
  private toolRegistry: ToolRegistry;
  
  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }
  
  async handleListToolsRequest(): Promise<ListToolsResponse> {
    const tools = await this.toolRegistry.listTools();
    return { tools };
  }
  
  async handleCallToolRequest(request: CallToolRequest): Promise<CallToolResponse> {
    try {
      const result = await this.toolRegistry.executeTool(
        request.params.name,
        request.params.arguments
      );
      
      return {
        content: Array.isArray(result.content) 
          ? result.content 
          : [{ type: "text", text: result.content }],
        isError: result.isError || false
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
}
```

## Core Tool Categories

### 1. Web Browsing Tools

The Multi-RoleAI app will include a headless browser system for web research and interaction:

#### Implementation Approach

1. **Self-Hosted Headless Browser**: 
   - Use Puppeteer or Playwright running in a Docker container
   - Implement security measures to prevent malicious actions

```typescript
// Web browsing tool implementation
class WebBrowserTool implements Tool {
  name = "web_browser";
  description = "Browse the web, search for information, and interact with websites";
  inputSchema = {
    type: "object",
    properties: {
      url: { type: "string", format: "uri" },
      action: { 
        type: "string", 
        enum: ["navigate", "search", "extract", "click", "fill", "screenshot"] 
      },
      selector: { type: "string" },
      value: { type: "string" }
    },
    required: ["action"]
  };
  
  async execute(params: any): Promise<ToolResponse> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Implement different actions based on params.action
      switch (params.action) {
        case "navigate":
          await page.goto(params.url);
          return { content: await page.content() };
          
        case "search":
          await page.goto("https://www.google.com");
          await page.type("input[name=q]", params.value);
          await page.keyboard.press("Enter");
          await page.waitForNavigation();
          return { content: await page.content() };
          
        case "extract":
          await page.goto(params.url);
          const content = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent : null;
          }, params.selector);
          return { content };
          
        // Implement other actions...
        
        default:
          return { 
            isError: true, 
            content: `Unknown action: ${params.action}` 
          };
      }
    } finally {
      await browser.close();
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox'],
        timeout: 5000
      }).then(browser => browser.close());
      return true;
    } catch {
      return false;
    }
  }
}
```

### 2. File System Tools

The Multi-RoleAI app will include tools for file system operations:

#### Implementation Approach

1. **Sandboxed File System**: 
   - Implement a virtual file system isolated to a specific directory
   - Prevent access to sensitive system files

```typescript
// File system tool implementation
class FileSystemTool implements Tool {
  name = "file_system";
  description = "Perform file system operations like reading, writing, and listing files";
  inputSchema = {
    type: "object",
    properties: {
      operation: { 
        type: "string", 
        enum: ["read", "write", "list", "delete", "move", "copy"] 
      },
      path: { type: "string" },
      content: { type: "string" },
      destination: { type: "string" }
    },
    required: ["operation", "path"]
  };
  
  private readonly BASE_DIR = process.env.FILE_SYSTEM_BASE_DIR || "/app/data";
  
  private resolvePath(path: string): string {
    // Ensure the path is within the allowed directory
    const resolvedPath = nodePath.resolve(this.BASE_DIR, path);
    
    if (!resolvedPath.startsWith(this.BASE_DIR)) {
      throw new Error("Path is outside of allowed directory");
    }
    
    return resolvedPath;
  }
  
  async execute(params: any): Promise<ToolResponse> {
    try {
      const resolvedPath = this.resolvePath(params.path);
      
      switch (params.operation) {
        case "read":
          const content = await fs.readFile(resolvedPath, "utf-8");
          return { content };
          
        case "write":
          await fs.writeFile(resolvedPath, params.content || "");
          return { content: `File written to ${params.path}` };
          
        case "list":
          const files = await fs.readdir(resolvedPath);
          const fileDetails = await Promise.all(
            files.map(async (file) => {
              const filePath = nodePath.join(resolvedPath, file);
              const stats = await fs.stat(filePath);
              return {
                name: file,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                modified: stats.mtime
              };
            })
          );
          return { content: JSON.stringify(fileDetails) };
          
        // Implement other operations...
        
        default:
          return { 
            isError: true, 
            content: `Unknown operation: ${params.operation}` 
          };
      }
    } catch (error) {
      return { 
        isError: true, 
        content: `File system error: ${error.message}` 
      };
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      await fs.access(this.BASE_DIR);
      return true;
    } catch {
      return false;
    }
  }
}
```

### 3. Code Execution Tools

The Multi-RoleAI app will include tools for executing code in various languages:

#### Implementation Approach

1. **Containerized Execution**: 
   - Use Docker to isolate code execution
   - Implement resource limits and timeouts
   - Support multiple languages (JavaScript, Python, etc.)

```typescript
// Code execution tool implementation
class CodeExecutionTool implements Tool {
  name = "code_execution";
  description = "Execute code in various programming languages";
  inputSchema = {
    type: "object",
    properties: {
      language: { 
        type: "string", 
        enum: ["javascript", "typescript", "python", "bash"] 
      },
      code: { type: "string" },
      timeout: { type: "number", default: 5000 }
    },
    required: ["language", "code"]
  };
  
  async execute(params: any): Promise<ToolResponse> {
    const { language, code, timeout = 5000 } = params;
    
    // Create a unique ID for this execution
    const executionId = crypto.randomUUID();
    const containerName = `code-execution-${executionId}`;
    
    try {
      // Select the appropriate Docker image based on language
      const dockerImage = this.getDockerImageForLanguage(language);
      
      // Write the code to a temporary file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-'));
      const codeFile = path.join(tempDir, this.getFilenameForLanguage(language));
      await fs.writeFile(codeFile, code);
      
      // Run the code in a Docker container with resource limits
      const command = this.getExecutionCommand(language, codeFile);
      
      const { stdout, stderr } = await this.runInDocker(
        dockerImage,
        containerName,
        command,
        tempDir,
        timeout
      );
      
      return {
        content: JSON.stringify({
          stdout,
          stderr,
          exitCode: 0
        })
      };
    } catch (error) {
      return {
        isError: true,
        content: JSON.stringify({
          error: error.message,
          exitCode: error.exitCode || 1
        })
      };
    }
  }
  
  private getDockerImageForLanguage(language: string): string {
    switch (language) {
      case "javascript":
      case "typescript":
        return "node:18-alpine";
      case "python":
        return "python:3.10-alpine";
      case "bash":
        return "alpine:latest";
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
  
  private getFilenameForLanguage(language: string): string {
    switch (language) {
      case "javascript":
        return "script.js";
      case "typescript":
        return "script.ts";
      case "python":
        return "script.py";
      case "bash":
        return "script.sh";
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
  
  private getExecutionCommand(language: string, filename: string): string {
    switch (language) {
      case "javascript":
        return `node ${filename}`;
      case "typescript":
        return `npx ts-node ${filename}`;
      case "python":
        return `python ${filename}`;
      case "bash":
        return `sh ${filename}`;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }
  
  private async runInDocker(
    image: string,
    containerName: string,
    command: string,
    volumePath: string,
    timeout: number
  ): Promise<{ stdout: string; stderr: string }> {
    // Implementation of Docker execution with resource limits
    // This would use the Docker API or exec to run the container
    // with appropriate volume mounts and resource constraints
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      // Check if Docker is available
      await exec("docker --version");
      return true;
    } catch {
      return false;
    }
  }
}
```

### 4. Database Tools

The Multi-RoleAI app will include tools for database operations using Prisma ORM:

#### Implementation Approach

1. **Prisma ORM Integration**: 
   - Use Prisma to provide a type-safe interface to the database
   - Implement access controls to prevent unauthorized operations

```typescript
// Database tool implementation
class DatabaseTool implements Tool {
  name = "database";
  description = "Perform database operations using Prisma ORM";
  inputSchema = {
    type: "object",
    properties: {
      operation: { 
        type: "string", 
        enum: ["query", "create", "update", "delete"] 
      },
      model: { type: "string" },
      where: { type: "object" },
      data: { type: "object" },
      select: { type: "object" },
      include: { type: "object" }
    },
    required: ["operation", "model"]
  };
  
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async execute(params: any): Promise<ToolResponse> {
    try {
      const { operation, model, where, data, select, include } = params;
      
      // Check if the model exists in Prisma
      if (!this.prisma[model.toLowerCase()]) {
        return {
          isError: true,
          content: `Model not found: ${model}`
        };
      }
      
      // Execute the appropriate Prisma operation
      switch (operation) {
        case "query":
          const results = await this.prisma[model.toLowerCase()].findMany({
            where,
            select,
            include
          });
          return { content: JSON.stringify(results) };
          
        case "create":
          const created = await this.prisma[model.toLowerCase()].create({
            data,
            select,
            include
          });
          return { content: JSON.stringify(created) };
          
        case "update":
          const updated = await this.prisma[model.toLowerCase()].update({
            where,
            data,
            select,
            include
          });
          return { content: JSON.stringify(updated) };
          
        case "delete":
          const deleted = await this.prisma[model.toLowerCase()].delete({
            where,
            select,
            include
          });
          return { content: JSON.stringify(deleted) };
          
        default:
          return {
            isError: true,
            content: `Unknown operation: ${operation}`
          };
      }
    } catch (error) {
      return {
        isError: true,
        content: `Database error: ${error.message}`
      };
    }
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      // Check if the database is accessible
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
```

### 5. External API Tools

The Multi-RoleAI app will include tools for interacting with external APIs:

#### Implementation Approach

1. **API Wrapper System**: 
   - Create standardized wrappers for external APIs
   - Implement rate limiting and error handling
   - Securely manage API keys

```typescript
// External API tool implementation
class ExternalAPITool implements Tool {
  name = "external_api";
  description = "Interact with external APIs";
  inputSchema = {
    type: "object",
    properties: {
      service: { 
        type: "string", 
        enum: ["weather", "news", "maps", "search"] 
      },
      endpoint: { type: "string" },
      method: { 
        type: "string", 
        enum: ["GET", "POST", "PUT", "DELETE"],
        default: "GET"
      },
      params: { type: "object" },
      body: { type: "object" }
    },
    required: ["service", "endpoint"]
  };
  
  private apiConfigs: Map<string, APIConfig> = new Map();
  
  constructor() {
    // Load API configurations from environment variables or config files
    this.loadAPIConfigs();
  }
  
  private loadAPIConfigs() {
    // Weather API
    this.apiConfigs.set("weather", {
      baseUrl: process.env.WEATHER_API_URL,
      apiKey: process.env.WEATHER_API_KEY,
      headers: { "Content-Type": "application/json" }
    });
    
    // News API
    this.apiConfigs.set("news", {
      baseUrl: process.env.NEWS_API_URL,
      apiKey: process.env.NEWS_API_KEY,
      headers: { "Content-Type": "application/json" }
    });
    
    // Add other API configurations...
  }
  
  async execute(params: any): Promise<ToolResponse> {
    try {
      const { service, endpoint, method = "GET", params: queryParams, body } = params;
      
      // Get the API configuration
      const config = this.apiConfigs.get(service);
      if (!config) {
        return {
          isError: true,
          content: `Unknown API service: ${service}`
        };
      }
      
      // Build the request URL
      const url = new URL(endpoint, config.baseUrl);
      
      // Add query parameters
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }
      
      // Add API key if required
      if (config.apiKey) {
        url.searchParams.append("api_key", config.apiKey);
      }
      
      // Make the API request
      const response = await fetch(url.toString(), {
        method,
        headers: config.headers,
        body: body ? JSON.stringify(body) : undefined
      });
      
      // Parse the response
      const data = await response.json();
      
      if (!response.ok) {
        return {
          isError: true,
          content: `API error: ${data.message || response.statusText}`
        };
      }
      
      return { content: JSON.stringify(data) };
    } catch (error) {
      return {
        isError: true,
        content: `API request error: ${error.message}`
      };
    }
  }
  
  async isAvailable(): Promise<boolean> {
    return this.apiConfigs.size > 0;
  }
}

interface APIConfig {
  baseUrl: string;
  apiKey?: string;
  headers: Record<string, string>;
}
```

### 6. Data Visualization Tools

The Multi-RoleAI app will include tools for generating data visualizations:

#### Implementation Approach

1. **Server-Side Rendering**: 
   - Use libraries like D3.js, Chart.js, or Plotly.js
   - Generate visualizations as SVG or PNG images
   - Support various chart types (bar, line, scatter, etc.)

```typescript
// Data visualization tool implementation
class DataVisualizationTool implements Tool {
  name = "data_visualization";
  description = "Generate data visualizations from datasets";
  inputSchema = {
    type: "object",
    properties: {
      type: { 
        type: "string", 
        enum: ["bar", "line", "pie", "scatter", "heatmap"] 
      },
      data: { 
        type: "array",
        items: { type: "object" }
      },
      options: { 
        type: "object",
        properties: {
          title: { type: "string" },
          xAxis: { type: "string" },
          yAxis: { type: "string" },
          width: { type: "number", default: 800 },
          height: { type: "number", default: 600 },
          colors: { 
            type: "array",
            items: { type: "string" }
          }
        }
      },
      format: {
        type: "string",
        enum: ["svg", "png", "json"],
        default: "svg"
      }
    },
    required: ["type", "data"]
  };
  
  async execute(params: any): Promise<ToolResponse> {
    try {
      const { type, data, options = {}, format = "svg" } = params;
      
      // Generate a unique filename for the output
      const outputId = crypto.randomUUID();
      const outputDir = path.join(os.tmpdir(), 'visualizations');
      await fs.mkdir(outputDir, { recursive: true });
      
      // Generate the visualization using a library like D3.js
      let result;
      
      switch (format) {
        case "svg":
          result = await this.generateSVG(type, data, options, outputId, outputDir);
          break;
        case "png":
          result = await this.generatePNG(type, data, options, outputId, outputDir);
          break;
        case "json":
          result = await this.generateJSON(type, data, options);
          break;
        default:
          return {
            isError: true,
            content: `Unsupported format: ${format}`
          };
      }
      
      return { content: result };
    } catch (error) {
      return {
        isError: true,
        content: `Visualization error: ${error.message}`
      };
    }
  }
  
  private async generateSVG(
    type: string,
    data: any[],
    options: any,
    outputId: string,
    outputDir: string
  ): Promise<string> {
    // Implementation using D3.js or similar to generate SVG
    // This would typically involve server-side rendering of D3 visualizations
  }
  
  private async generatePNG(
    type: string,
    data: any[],
    options: any,
    outputId: string,
    outputDir: string
  ): Promise<string> {
    // Generate SVG first, then convert to PNG using a library like sharp
  }
  
  private async generateJSON(
    type: string,
    data: any[],
    options: any
  ): Promise<string> {
    // Generate a JSON representation of the visualization
    // This could be used with client-side libraries like Chart.js
  }
  
  async isAvailable(): Promise<boolean> {
    // Check if the required libraries are available
    return true;
  }
}
```

## Security Considerations

### 1. Input Validation

All tool inputs will be validated against JSON Schema definitions to prevent injection attacks and ensure proper data types.

### 2. Sandboxed Execution

Code execution and file system operations will be performed in isolated Docker containers with:

- Resource limits (CPU, memory, network)
- Timeouts to prevent infinite loops
- No access to sensitive system resources

### 3. Access Control

Tools will implement proper authentication and authorization:

- User-based permissions for tool access
- Rate limiting to prevent abuse
- Audit logging of all tool operations

### 4. Error Handling

Tools will implement robust error handling:

- Sanitized error messages to prevent information leakage
- Graceful failure modes
- Comprehensive logging for debugging

## Implementation Plan

### Phase 1: Core Tool Infrastructure

1. Implement the Tool Registry system
2. Set up the Model Context Protocol server
3. Create the base Tool interface and abstract classes
4. Implement security measures and sandboxing

### Phase 2: Basic Tools

1. Implement File System tools
2. Implement Database tools using Prisma
3. Implement simple Web Browser tools
4. Create basic External API integrations

### Phase 3: Advanced Tools

1. Implement Code Execution tools with Docker isolation
2. Add Data Visualization capabilities
3. Implement more sophisticated Web Browser interactions
4. Expand External API integrations

### Phase 4: Optimization and Scaling

1. Implement caching for tool results
2. Add monitoring and performance metrics
3. Optimize resource usage
4. Implement parallel tool execution where appropriate

## Conclusion

This tool integration approach provides a comprehensive, secure, and extensible system for enabling AI agents in the Multi-RoleAI application to interact with various external systems and perform complex tasks. By focusing on self-hosted tools running on the VPS, we maintain control over the entire system while providing powerful capabilities to the AI agents.

The Model Context Protocol integration provides a standardized way for AI models to discover and use tools, enhancing the system's flexibility and making it easier to add new tools in the future. The security measures ensure that the tools operate safely and securely, preventing potential abuse or security issues.

With this architecture, the Multi-RoleAI application will be able to perform a wide range of tasks autonomously, from web research and data analysis to code execution and file management, all while maintaining security, privacy, and control.
