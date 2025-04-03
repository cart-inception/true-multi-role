import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { taskManagementService, TaskPriority } from '@/services/taskManagementService';

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as any;
    
    const tasks = await taskManagementService.getUserTasks(userId, status);
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const { 
      title, 
      description, 
      priority = 'MEDIUM', 
      workspaceId,
      parentTaskId,
      dependencies,
      context
    } = await request.json();
    
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    // Validate priority
    if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      );
    }

    const newTask = await taskManagementService.createTask(
      userId,
      title,
      description,
      priority as TaskPriority,
      workspaceId,
      parentTaskId,
      dependencies,
      context
    );
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
