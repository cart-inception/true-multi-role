/**
 * Agent Session Service
 * 
 * This service manages agent sessions, including creation, retrieval, 
 * and interaction with agents within a session.
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { 
  AgentSession, 
  AgentMessage, 
  AgentRole,
  AgentExecutionResult 
} from '@/types/agent';
import { 
  createAgent, 
  createAllWorkerAgents, 
  ControllerAgent 
} from './agents';

export class AgentSessionService {
  /**
   * Create a new agent session
   * @param userId The ID of the user who owns the session
   * @param name Optional name for the session
   * @param taskId Optional ID of the associated task
   * @returns The created agent session
   */
  async createSession(
    userId: string,
    name?: string,
    taskId?: string
  ): Promise<AgentSession> {
    // Create the session in the database
    const session = await prisma.agentSession.create({
      data: {
        id: randomUUID(),
        name: name || `Session ${new Date().toLocaleString()}`,
        status: 'ACTIVE',
        userId,
        taskId,
        context: {},
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return session as unknown as AgentSession;
  }

  /**
   * Get an agent session by ID
   * @param sessionId The ID of the session to retrieve
   * @returns The agent session
   */
  async getSession(sessionId: string): Promise<AgentSession | null> {
    const session = await prisma.agentSession.findUnique({
      where: { id: sessionId },
    });

    return session as unknown as AgentSession;
  }

  /**
   * Get all agent sessions for a user
   * @param userId The ID of the user
   * @returns An array of agent sessions
   */
  async getUserSessions(userId: string): Promise<AgentSession[]> {
    const sessions = await prisma.agentSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return sessions as unknown as AgentSession[];
  }

  /**
   * Add a message to an agent session
   * @param sessionId The ID of the session
   * @param message The message to add
   * @returns The updated session
   */
  async addMessageToSession(
    sessionId: string,
    message: AgentMessage
  ): Promise<AgentSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const history = [...(session.history || []), message];

    const updatedSession = await prisma.agentSession.update({
      where: { id: sessionId },
      data: {
        history,
        updatedAt: new Date(),
      },
    });

    return updatedSession as unknown as AgentSession;
  }

  /**
   * Process a user message with the controller agent
   * @param sessionId The ID of the session
   * @param content The content of the user message
   * @param apiKey Optional API key for the agent
   * @returns The agent's response message
   */
  async processUserMessage(
    sessionId: string,
    content: string,
    apiKey?: string
  ): Promise<AgentMessage> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Create the controller agent with worker agents
    const controller = new ControllerAgent(
      'Session Controller',
      'Orchestrates the multi-agent system',
      undefined,
      [],
      apiKey
    );
    
    // Initialize the controller with session history
    if (session.history && session.history.length > 0) {
      session.history.forEach((message) => {
        controller.addMessage(message);
      });
    }

    // Create the user message
    const userMessage: AgentMessage = {
      role: AgentRole.USER,
      content,
      createdAt: new Date().toISOString(),
    };

    // Add the user message to the session
    await this.addMessageToSession(sessionId, userMessage);

    // Process the message with the controller agent
    const response = await controller.process(userMessage);

    // Add the agent's response to the session
    await this.addMessageToSession(sessionId, response);

    return response;
  }

  /**
   * Execute a task with a specific worker agent
   * @param sessionId The ID of the session
   * @param workerRole The role of the worker agent to use
   * @param task The task to execute
   * @param apiKey Optional API key for the agent
   * @returns The result of the task execution
   */
  async executeWorkerTask(
    sessionId: string,
    workerRole: AgentRole,
    task: any,
    apiKey?: string
  ): Promise<AgentExecutionResult> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Create the controller agent
    const controller = new ControllerAgent(
      'Session Controller',
      'Orchestrates the multi-agent system',
      undefined,
      [],
      apiKey
    );
    
    // Initialize the controller with session history
    if (session.history && session.history.length > 0) {
      session.history.forEach((message) => {
        controller.addMessage(message);
      });
    }

    // Execute the task with the specified worker
    const result = await controller.assignTask(task, workerRole);

    // If the task execution resulted in messages, add them to the session
    if (result.data && Array.isArray(result.data.messages)) {
      for (const message of result.data.messages) {
        await this.addMessageToSession(sessionId, message);
      }
    }

    return result;
  }

  /**
   * Update the status of an agent session
   * @param sessionId The ID of the session
   * @param status The new status
   * @returns The updated session
   */
  async updateSessionStatus(
    sessionId: string,
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED'
  ): Promise<AgentSession> {
    const updatedSession = await prisma.agentSession.update({
      where: { id: sessionId },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });

    return updatedSession as unknown as AgentSession;
  }
}

// Export a singleton instance of the service
export const agentSessionService = new AgentSessionService();
