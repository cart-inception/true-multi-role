/**
 * Worker Agent Implementation
 * 
 * This class serves as the base for specialized worker agents in the Multi-RoleAI system.
 * It extends the BaseAgent with worker-specific functionality.
 */

import { 
  AgentExecutionResult, 
  AgentRole, 
  Tool, 
  WorkerAgent 
} from '@/types/agent';
import { BaseAgent } from './baseAgent';

export class WorkerAgentImpl extends BaseAgent implements WorkerAgent {
  specialization: string;
  capabilities: string[];
  
  constructor(
    name: string,
    role: AgentRole,
    description: string,
    systemPrompt: string,
    specialization: string,
    capabilities: string[] = [],
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(name, role, description, systemPrompt, tools, apiKey);
    
    this.specialization = specialization;
    this.capabilities = capabilities;
  }
  
  /**
   * Execute a task assigned by the controller agent
   */
  async executeTask(task: any): Promise<AgentExecutionResult> {
    try {
      // Format the task as a message to the agent
      let taskPrompt: string;
      
      if (typeof task === 'string') {
        taskPrompt = task;
      } else {
        taskPrompt = `
          Task ID: ${task.id || 'unknown'}
          Assigned by: ${task.assignedBy || 'Controller Agent'}
          Task description: ${task.description || JSON.stringify(task)}
          
          Please complete this task to the best of your abilities using your specialized skills as a ${this.specialization}.
          Provide a comprehensive and detailed response.
        `;
      }
      
      // Process the task and get the response
      const response = await this.process(taskPrompt);
      
      return {
        success: true,
        message: 'Task executed successfully',
        data: {
          taskId: typeof task === 'object' && task.id ? task.id : undefined,
          response,
        },
      };
    } catch (error) {
      console.error(`Error executing task on ${this.name}:`, error);
      
      return {
        success: false,
        message: `Error executing task: ${error.message}`,
        error,
      };
    }
  }
}
