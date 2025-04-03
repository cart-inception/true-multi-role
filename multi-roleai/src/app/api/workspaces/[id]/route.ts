import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/utils/logger';

const workspaceUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().optional(),
});

/**
 * GET /api/workspaces/[id]
 * Get a specific workspace by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (workspace.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    logger.error(`Error fetching workspace ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workspaces/[id]
 * Update a workspace
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists and belongs to user
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    if (existingWorkspace.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const validationResult = workspaceUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description } = validationResult.data;
    
    const updatedWorkspace = await prisma.workspace.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    logger.info(`User ${session.user.id} updated workspace ${params.id}`);
    
    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    logger.error(`Error updating workspace ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[id]
 * Delete a workspace
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists and belongs to user
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    if (existingWorkspace.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the workspace
    await prisma.workspace.delete({
      where: {
        id: params.id,
      },
    });

    logger.info(`User ${session.user.id} deleted workspace ${params.id}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting workspace ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
