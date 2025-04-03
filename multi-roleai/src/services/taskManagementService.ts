/**
 * Task Management Service
 * 
 * This service manages tasks, including creation, assignment to agents,
 * tracking progress, and handling task completion.
 */

import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { AgentRole } from '@/types/agent';

// Task status types
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

// Task priority levels
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Task interface that matches our database schema
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  workspaceId?: string;
  assignedAgentRole?: AgentRole;
  parentTaskId?: string;
  subtasks?: string[];
  dependencies?: string[];
  context?: Record<string, any>;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class TaskManagementService {
  /**
   * Create a new task
   * @param userId The ID of the user who owns the task
   * @param title The title of the task
   * @param description The description of the task
   * @param priority The priority of the task
   * @param workspaceId Optional ID of the associated workspace
   * @param parentTaskId Optional ID of the parent task
   * @param dependencies Optional IDs of tasks that this task depends on
   * @param context Optional context data for the task
   * @returns The created task
   */
  async createTask(
    userId: string,
    title: string,
    description: string,
    priority: TaskPriority = 'MEDIUM',
    workspaceId?: string,
    parentTaskId?: string,
    dependencies?: string[],
    context?: Record<string, any>
  ): Promise<Task> {
    // Create the task in the database
    const task = await prisma.task.create({
      data: {
        id: randomUUID(),
        title,
        description,
        status: 'PENDING',
        priority,
        userId,
        workspaceId,
        parentTaskId,
        dependencies,
        context,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // If this is a subtask, update the parent task
    if (parentTaskId) {
      const parentTask = await prisma.task.findUnique({
        where: { id: parentTaskId },
      });

      if (parentTask) {
        const subtasks = [...(parentTask.subtasks || []), task.id];
        await prisma.task.update({
          where: { id: parentTaskId },
          data: { subtasks, updatedAt: new Date() },
        });
      }
    }

    return task as unknown as Task;
  }

  /**
   * Get a task by ID
   * @param taskId The ID of the task to retrieve
   * @returns The task
   */
  async getTask(taskId: string): Promise<Task | null> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    return task as unknown as Task;
  }

  /**
   * Get all tasks for a user
   * @param userId The ID of the user
   * @param status Optional status filter
   * @returns An array of tasks
   */
  async getUserTasks(userId: string, status?: TaskStatus): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        parentTaskId: null, // Only get top-level tasks
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return tasks as unknown as Task[];
  }

  /**
   * Get all subtasks for a parent task
   * @param parentTaskId The ID of the parent task
   * @returns An array of subtasks
   */
  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    const tasks = await prisma.task.findMany({
      where: { parentTaskId },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return tasks as unknown as Task[];
  }

  /**
   * Assign a task to an agent
   * @param taskId The ID of the task
   * @param agentRole The role of the agent to assign
   * @returns The updated task
   */
  async assignTaskToAgent(
    taskId: string,
    agentRole: AgentRole
  ): Promise<Task> {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedAgentRole: agentRole,
        updatedAt: new Date(),
      },
    });

    return updatedTask as unknown as Task;
  }

  /**
   * Update the status of a task
   * @param taskId The ID of the task
   * @param status The new status
   * @param result Optional result data to save with the task
   * @returns The updated task
   */
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    result?: any
  ): Promise<Task> {
    const updatedData: any = {
      status,
      updatedAt: new Date(),
    };

    // Add timestamp based on status
    if (status === 'IN_PROGRESS' && !await this.hasStarted(taskId)) {
      updatedData.startedAt = new Date();
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      updatedData.completedAt = new Date();
    }

    // Add result if provided
    if (result !== undefined) {
      updatedData.result = result;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updatedData,
    });

    return updatedTask as unknown as Task;
  }

  /**
   * Check if all dependencies of a task are completed
   * @param taskId The ID of the task
   * @returns True if all dependencies are completed
   */
  async areDependenciesMet(taskId: string): Promise<boolean> {
    const task = await this.getTask(taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    const dependencies = await prisma.task.findMany({
      where: {
        id: { in: task.dependencies },
      },
    });

    return dependencies.every(dep => dep.status === 'COMPLETED');
  }

  /**
   * Check if a task has started
   * @param taskId The ID of the task
   * @returns True if the task has started
   */
  async hasStarted(taskId: string): Promise<boolean> {
    const task = await this.getTask(taskId);
    return !!(task && task.startedAt);
  }

  /**
   * Decompose a task into subtasks
   * @param taskId The ID of the parent task
   * @param subtasks Array of subtask objects with title, description, and optionally priority
   * @returns Array of created subtasks
   */
  async decomposeTask(
    taskId: string,
    subtasks: Array<{
      title: string;
      description: string;
      priority?: TaskPriority;
      assignedAgentRole?: AgentRole;
      dependencies?: string[];
      context?: Record<string, any>;
    }>
  ): Promise<Task[]> {
    const parentTask = await this.getTask(taskId);
    if (!parentTask) {
      throw new Error(`Parent task not found: ${taskId}`);
    }

    const createdSubtasks: Task[] = [];
    const subtaskIds: string[] = [];

    // Create each subtask
    for (const subtask of subtasks) {
      const newSubtask = await this.createTask(
        parentTask.userId,
        subtask.title,
        subtask.description,
        subtask.priority || 'MEDIUM',
        parentTask.workspaceId,
        taskId,
        subtask.dependencies,
        subtask.context
      );

      // Assign to agent if specified
      if (subtask.assignedAgentRole) {
        await this.assignTaskToAgent(newSubtask.id, subtask.assignedAgentRole);
      }

      createdSubtasks.push(newSubtask);
      subtaskIds.push(newSubtask.id);
    }

    // Update parent task with subtasks
    await prisma.task.update({
      where: { id: taskId },
      data: {
        subtasks: subtaskIds,
        updatedAt: new Date(),
      },
    });

    return createdSubtasks;
  }

  /**
   * Update the progress and status of a parent task based on its subtasks
   * @param parentTaskId The ID of the parent task
   * @returns The updated parent task
   */
  async updateParentTaskProgress(parentTaskId: string): Promise<Task> {
    const parentTask = await this.getTask(parentTaskId);
    if (!parentTask || !parentTask.subtasks || parentTask.subtasks.length === 0) {
      throw new Error(`Invalid parent task: ${parentTaskId}`);
    }

    const subtasks = await prisma.task.findMany({
      where: {
        id: { in: parentTask.subtasks },
      },
    });

    // Calculate overall progress
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(
      task => task.status === 'COMPLETED'
    ).length;
    const failedSubtasks = subtasks.filter(
      task => task.status === 'FAILED'
    ).length;

    // Determine parent task status
    let newStatus = parentTask.status;

    if (completedSubtasks === totalSubtasks) {
      newStatus = 'COMPLETED';
    } else if (failedSubtasks > 0) {
      // If any subtask failed, status depends on whether critical subtasks failed
      // For now, we'll mark the parent as failed if any subtasks failed
      newStatus = 'FAILED';
    } else if (subtasks.some(task => task.status === 'IN_PROGRESS')) {
      newStatus = 'IN_PROGRESS';
    }

    // Update parent task
    const progressData = {
      progress: Math.floor((completedSubtasks / totalSubtasks) * 100),
      completedSubtasks,
      totalSubtasks,
      failedSubtasks,
    };

    return this.updateTaskStatus(parentTaskId, newStatus, {
      ...parentTask.result,
      progressData,
    });
  }
}

// Export a singleton instance of the service
export const taskManagementService = new TaskManagementService();
