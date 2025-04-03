import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/utils/logger';

const agentUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().optional(),
  role: z.string().optional(),
  workspaceId: z.string().optional(),
  systemPrompt: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

/**
 * GET /api/agents/[id]
 * Get a specific agent by ID
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

    const agent = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (agent.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    logger.error(`Error fetching agent ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agents/[id]
 * Update an agent
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

    // Check if agent exists and belongs to user
    const existingAgent = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (existingAgent.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const validationResult = agentUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { 
      name, 
      description, 
      role, 
      workspaceId,
      systemPrompt,
      settings 
    } = validationResult.data;

    // If workspaceId is provided, verify the user has access to it
    if (workspaceId) {
      const workspace = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
      });

      if (!workspace || workspace.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Invalid workspace ID' },
          { status: 400 }
        );
      }
    }
    
    const updatedAgent = await prisma.agent.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(role !== undefined && { role }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(settings !== undefined && { settings }),
        ...(workspaceId !== undefined && { workspaceId }),
      },
    });

    logger.info(`User ${session.user.id} updated agent ${params.id}`);
    
    return NextResponse.json(updatedAgent);
  } catch (error) {
    logger.error(`Error updating agent ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]
 * Delete an agent
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

    // Check if agent exists and belongs to user
    const existingAgent = await prisma.agent.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (existingAgent.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the agent
    await prisma.agent.delete({
      where: {
        id: params.id,
      },
    });

    logger.info(`User ${session.user.id} deleted agent ${params.id}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting agent ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
