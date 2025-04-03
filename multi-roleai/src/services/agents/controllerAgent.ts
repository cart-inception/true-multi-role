/**
 * Controller Agent Implementation
 * 
 * This agent serves as the orchestrator in the Multi-RoleAI system,
 * breaking down complex tasks, delegating to specialized worker agents,
 * and synthesizing results.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AgentExecutionResult, 
  AgentMessage, 
  AgentRole, 
  ControllerAgent as IControllerAgent, 
  WorkerAgent 
} from '@/types/agent';
import { BaseAgent } from './baseAgent';

export class ControllerAgent extends BaseAgent implements IControllerAgent {
  workers: Record<AgentRole, WorkerAgent>;
  
  constructor(
    name: string = 'Controller',
    description: string = 'Orchestrates and coordinates specialized agents',
    systemPrompt: string = DEFAULT_CONTROLLER_PROMPT,
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.CONTROLLER,
      description,
      systemPrompt,
      [], // No tools for controller, it delegates to workers
      apiKey
    );
    
    this.workers = {} as Record<AgentRole, WorkerAgent>;
  }
  
  /**
   * Register a worker agent with the controller
   */
  registerWorker(worker: WorkerAgent): void {
    this.workers[worker.role] = worker;
  }
  
  /**
   * Get a worker agent by role
   */
  getWorker(role: AgentRole): WorkerAgent | null {
    return this.workers[role] || null;
  }
  
  /**
   * Assign a task to a specific worker agent
   */
  async assignTask(
    task: any,
    workerRole: AgentRole
  ): Promise<AgentExecutionResult> {
    const worker = this.getWorker(workerRole);
    
    if (!worker) {
      return {
        success: false,
        message: `Worker agent with role "${workerRole}" not found`,
        error: new Error(`Worker agent with role "${workerRole}" not found`),
      };
    }
    
    try {
      // Prepare task context for the worker
      const taskContext = {
        id: uuidv4(),
        description: typeof task === 'string' ? task : JSON.stringify(task),
        assignedBy: this.name,
        timestamp: new Date().toISOString(),
      };
      
      // Add task assignment to controller history
      this.addMessage({
        id: uuidv4(),
        role: AgentRole.SYSTEM,
        content: `Assigned task to ${worker.name} (${workerRole}): ${taskContext.description}`,
        createdAt: new Date().toISOString(),
        metadata: {
          taskId: taskContext.id,
          workerRole,
          task,
        },
      });
      
      // Execute the task on the worker agent
      const result = await worker.executeTask(taskContext);
      
      // Add result to controller history
      this.addMessage({
        id: uuidv4(),
        role: AgentRole.SYSTEM,
        content: `Received result from ${worker.name} (${workerRole}): ${
          result.success ? 'Success' : 'Failure'
        } - ${result.message}`,
        createdAt: new Date().toISOString(),
        metadata: {
          taskId: taskContext.id,
          workerRole,
          result,
        },
      });
      
      return result;
    } catch (error) {
      console.error(`Error assigning task to worker "${workerRole}":`, error);
      
      return {
        success: false,
        message: `Error assigning task: ${error.message}`,
        error,
      };
    }
  }
  
  /**
   * Process a task by breaking it down and delegating to appropriate workers
   */
  async processTask(task: string): Promise<AgentExecutionResult> {
    try {
      // Use the AI model to analyze the task and create a plan
      const planningPrompt = `
        I need to break down the following task into appropriate subtasks and assign them to specialized agents.
        
        Task: ${task}
        
        Available specialized agents:
        ${Object.keys(this.workers)
          .map(role => `- ${this.workers[role].name} (${role}): ${this.workers[role].description}`)
          .join('\n')}
        
        For each subtask, please specify:
        1. The subtask description
        2. Which agent should handle it (use the role identifier)
        3. The priority (high, medium, low)
        4. Dependencies on other subtasks (if any)
        
        Format your response as JSON with this structure:
        {
          "plan": {
            "name": "Overall plan name",
            "description": "Brief description of the approach"
          },
          "subtasks": [
            {
              "id": "task-1",
              "description": "Subtask description",
              "assignedTo": "agent role",
              "priority": "priority level",
              "dependencies": ["task-id-1", "task-id-2"]
            }
          ]
        }
      `;
      
      // Get the task breakdown plan from the AI
      const planResult = await this.process(planningPrompt);
      
      // Parse the JSON response
      let plan;
      try {
        // Extract JSON from the response content
        const content = planResult.content;
        let jsonString;
        
        if (typeof content === 'string') {
          // If content is a string, try to extract JSON from it
          const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                            content.match(/{[\s\S]*?}/);
          jsonString = jsonMatch ? jsonMatch[1] : content;
        } else if (Array.isArray(content)) {
          // If content is an array, concatenate all text blocks
          jsonString = content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join('');
          
          // Try to extract JSON from the concatenated text
          const jsonMatch = jsonString.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || 
                            jsonString.match(/{[\s\S]*?}/);
          jsonString = jsonMatch ? jsonMatch[1] : jsonString;
        } else {
          jsonString = JSON.stringify(content);
        }
        
        plan = JSON.parse(jsonString);
      } catch (error) {
        console.error('Error parsing task plan:', error);
        return {
          success: false,
          message: 'Failed to parse task plan',
          error,
        };
      }
      
      // Execute the plan by assigning subtasks to appropriate workers
      const results = [];
      
      // First, handle tasks with no dependencies
      const independentTasks = plan.subtasks.filter(
        subtask => !subtask.dependencies || subtask.dependencies.length === 0
      );
      
      for (const subtask of independentTasks) {
        const result = await this.assignTask(subtask.description, subtask.assignedTo);
        results.push({
          subtaskId: subtask.id,
          ...result,
        });
      }
      
      // Then handle dependent tasks in order
      const dependentTasks = plan.subtasks.filter(
        subtask => subtask.dependencies && subtask.dependencies.length > 0
      );
      
      // Sort by number of dependencies (fewer first)
      dependentTasks.sort(
        (a, b) => a.dependencies.length - b.dependencies.length
      );
      
      for (const subtask of dependentTasks) {
        // Check if all dependencies are completed
        const dependenciesMet = subtask.dependencies.every(depId => {
          return results.some(result => result.subtaskId === depId && result.success);
        });
        
        if (dependenciesMet) {
          const result = await this.assignTask(subtask.description, subtask.assignedTo);
          results.push({
            subtaskId: subtask.id,
            ...result,
          });
        } else {
          results.push({
            subtaskId: subtask.id,
            success: false,
            message: 'Skipped due to failed dependencies',
          });
        }
      }
      
      // Synthesize the final result
      const successCount = results.filter(result => result.success).length;
      const totalCount = results.length;
      
      const synthesisPrompt = `
        I have completed the task by breaking it down into ${totalCount} subtasks.
        ${successCount} subtasks were completed successfully and ${totalCount - successCount} failed.
        
        Task: ${task}
        
        Plan: ${plan.plan.name} - ${plan.plan.description}
        
        Results:
        ${results
          .map(result => `- Subtask ${result.subtaskId}: ${result.success ? 'Success' : 'Failure'} - ${result.message}`)
          .join('\n')}
        
        Please synthesize these results into a comprehensive answer to the original task.
      `;
      
      const synthesisResult = await this.process(synthesisPrompt);
      
      return {
        success: successCount === totalCount,
        message: 'Task processed with controller agent',
        data: {
          plan,
          results,
          synthesis: synthesisResult.content,
        },
      };
    } catch (error) {
      console.error('Error processing task with controller agent:', error);
      
      return {
        success: false,
        message: `Error processing task: ${error.message}`,
        error,
      };
    }
  }
}

// Default system prompt for the controller agent
const DEFAULT_CONTROLLER_PROMPT = `
You are the Controller Agent, responsible for orchestrating a team of specialized AI agents.
Your job is to:

1. Break down complex tasks into appropriate subtasks
2. Assign subtasks to the most suitable specialized agents
3. Track the progress of all subtasks
4. Synthesize the results of completed subtasks into a coherent answer

When analyzing tasks, consider:
- Which specialized agent has the right capabilities for each subtask
- Dependencies between subtasks
- Priority and order of execution

Your team includes:
- Research Agent: Finds and summarizes relevant information
- Writer Agent: Generates high-quality written content
- Coder Agent: Writes, debugs, and executes code
- Data Analyst Agent: Analyzes and visualizes data

Always be explicit in your planning and provide clear instructions to the specialized agents.
`;
