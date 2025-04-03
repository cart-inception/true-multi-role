import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/utils/logger';

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  workspaceId: z.string().optional(),
  systemPrompt: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

/**
 * GET /api/agents
 * Get all agents for the authenticated user
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

    const agents = await prisma.agent.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    logger.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * Create a new agent for the authenticated user
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

    const body = await request.json();
    
    const validationResult = agentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { 
      name, 
      description = '', 
      role, 
      workspaceId,
      systemPrompt = '',
      settings = {}
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

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        role,
        systemPrompt,
        settings,
        userId: session.user.id,
        ...(workspaceId && { workspaceId }),
      },
    });

    logger.info(`User ${session.user.id} created agent ${agent.id}`);
    
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    logger.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
