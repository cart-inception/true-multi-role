/**
 * Agent Registry
 * 
 * This file exports all agent implementations for easy access throughout the application.
 */

// Base and abstract agents
export * from './baseAgent';
export * from './workerAgent';

// Controller agent (orchestrator)
export * from './controllerAgent';

// Specialized worker agents
export * from './researchAgent';
export * from './writerAgent';
export * from './coderAgent';
export * from './dataAnalystAgent';
export * from './designerAgent';
export * from './devOpsAgent';
export * from './securityAgent';

// Agent factory and utilities
import { AgentRole, Agent } from '@/types/agent';
import { ControllerAgent } from './controllerAgent';
import { ResearchAgent } from './researchAgent';
import { WriterAgent } from './writerAgent';
import { CoderAgent } from './coderAgent';
import { DataAnalystAgent } from './dataAnalystAgent';
import { DesignerAgent } from './designerAgent';
import { DevOpsAgent } from './devOpsAgent';
import { SecurityAgent } from './securityAgent';

/**
 * Create an agent instance based on the specified role
 * @param role The role of the agent to create
 * @param apiKey Optional API key for the agent
 * @returns An agent instance of the specified role
 */
export function createAgent(role: AgentRole, apiKey?: string): Agent {
  switch (role) {
    case AgentRole.CONTROLLER:
      return new ControllerAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.RESEARCHER:
      return new ResearchAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.WRITER:
      return new WriterAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.CODER:
      return new CoderAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.ANALYST:
      return new DataAnalystAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.DESIGNER:
      return new DesignerAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.DEVOPS:
      return new DevOpsAgent(undefined, undefined, undefined, [], apiKey);
    case AgentRole.SECURITY:
      return new SecurityAgent(undefined, undefined, undefined, [], apiKey);
    default:
      throw new Error(`Unsupported agent role: ${role}`);
  }
}

/**
 * Create all specialized worker agents
 * @param apiKey Optional API key for the agents
 * @returns An object containing all worker agents, keyed by role
 */
export function createAllWorkerAgents(apiKey?: string) {
  return {
    [AgentRole.RESEARCHER]: new ResearchAgent(undefined, undefined, undefined, [], apiKey),
    [AgentRole.WRITER]: new WriterAgent(undefined, undefined, undefined, [], apiKey),
    [AgentRole.CODER]: new CoderAgent(undefined, undefined, undefined, [], apiKey),
    [AgentRole.ANALYST]: new DataAnalystAgent(undefined, undefined, undefined, [], apiKey),
    [AgentRole.DESIGNER]: new DesignerAgent(undefined, undefined, undefined, [], apiKey),
    [AgentRole.DEVOPS]: new DevOpsAgent(undefined, undefined, undefined, [], apiKey),
    [AgentRole.SECURITY]: new SecurityAgent(undefined, undefined, undefined, [], apiKey),
  };
}
