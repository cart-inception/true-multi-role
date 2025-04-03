/**
 * Base Agent Implementation
 * 
 * This class provides the foundation for all agent types in the Multi-RoleAI system.
 * It implements the core agent functionality and uses the Anthropic Claude API for AI capabilities.
 */

import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentMessage, AgentRole, MessageContent, Tool } from '@/types/agent';
import { AnthropicService } from '../anthropic';

export class BaseAgent implements Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  tools: Tool[];
  private anthropicService: AnthropicService;
  private history: AgentMessage[];
  
  constructor(
    name: string,
    role: AgentRole,
    description: string,
    systemPrompt: string,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    this.id = uuidv4();
    this.name = name;
    this.role = role;
    this.description = description;
    this.systemPrompt = systemPrompt;
    this.tools = tools;
    this.anthropicService = new AnthropicService(apiKey);
    this.history = [];
  }
  
  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    // Add system message to history
    this.addMessage({
      id: uuidv4(),
      role: AgentRole.SYSTEM,
      content: this.systemPrompt,
      createdAt: new Date().toISOString(),
    });
  }
  
  /**
   * Process an input message and generate a response
   */
  async process(input: string | AgentMessage): Promise<AgentMessage> {
    // Convert string input to AgentMessage if needed
    if (typeof input === 'string') {
      const userMessage: AgentMessage = {
        id: uuidv4(),
        role: AgentRole.USER,
        content: input,
        createdAt: new Date().toISOString(),
      };
      this.addMessage(userMessage);
    } else {
      this.addMessage(input);
    }
    
    // Prepare messages for API call (excluding system message)
    const messages = this.getHistory().filter(msg => msg.role !== AgentRole.SYSTEM);
    
    // Prepare tools for API call if available
    const tools = this.tools.length > 0
      ? this.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        }))
      : undefined;
    
    // Call Anthropic API
    const response = await this.anthropicService.sendMessage(messages, {
      system: this.systemPrompt,
      tools,
      temperature: 0.7,
    });
    
    // Add response to history
    this.addMessage(response);
    
    return response;
  }
  
  /**
   * Use a tool with the specified parameters
   */
  async useTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.find(t => t.name === toolName);
    
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`);
    }
    
    try {
      const result = await tool.execute(params);
      
      // Add tool usage to history
      const toolMessage: AgentMessage = {
        id: uuidv4(),
        role: AgentRole.SYSTEM,
        content: `Used tool "${toolName}" with result: ${JSON.stringify(result)}`,
        createdAt: new Date().toISOString(),
        metadata: {
          toolName,
          params,
          result,
        },
      };
      
      this.addMessage(toolMessage);
      
      return result;
    } catch (error) {
      console.error(`Error using tool "${toolName}":`, error);
      throw error;
    }
  }
  
  /**
   * Get the full message history
   */
  getHistory(): AgentMessage[] {
    return [...this.history];
  }
  
  /**
   * Add a message to the history
   */
  addMessage(message: AgentMessage): void {
    // Ensure message has an ID
    if (!message.id) {
      message.id = uuidv4();
    }
    
    this.history.push(message);
  }
  
  /**
   * Clear the message history
   */
  clearHistory(): void {
    // Keep only the system message if it exists
    const systemMessage = this.history.find(msg => msg.role === AgentRole.SYSTEM);
    this.history = systemMessage ? [systemMessage] : [];
  }
}
