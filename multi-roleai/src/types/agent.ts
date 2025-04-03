/**
 * Type definitions for the AI agent system in Multi-RoleAI
 */

// Agent roles
export enum AgentRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  CONTROLLER = 'controller',
  RESEARCHER = 'researcher',
  WRITER = 'writer',
  CODER = 'coder',
  ANALYST = 'analyst',
  DESIGNER = 'designer',
  DEVOPS = 'devops',
  SECURITY = 'security',
}

// Message content can be a string, array of content blocks, or structured content
export type MessageContent = string | any[] | Record<string, any>;

// Agent message definition
export interface AgentMessage {
  id?: string;
  role: AgentRole;
  content: MessageContent;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Tool definition
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

// Agent Session definition matching our database schema
export interface AgentSession {
  id: string;
  name?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  userId: string;
  taskId?: string;
  context?: Record<string, any>;
  history?: AgentMessage[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Agent execution result
export interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

// Agent implementation interface
export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  tools: Tool[];
  
  // Core methods
  initialize: () => Promise<void>;
  process: (input: string | AgentMessage) => Promise<AgentMessage>;
  useTool: (toolName: string, params: any) => Promise<any>;
  getHistory: () => AgentMessage[];
  addMessage: (message: AgentMessage) => void;
  clearHistory: () => void;
}

// Controller agent interface (orchestrator)
export interface ControllerAgent extends Agent {
  workers: Record<AgentRole, Agent>;
  assignTask: (task: any, workerRole: AgentRole) => Promise<AgentExecutionResult>;
  getWorker: (role: AgentRole) => Agent | null;
}

// Worker agent interface
export interface WorkerAgent extends Agent {
  specialization: string;
  capabilities: string[];
  executeTask: (task: any) => Promise<AgentExecutionResult>;
}
