import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/utils/logger';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
});

/**
 * GET /api/workspaces
 * Get all workspaces for the authenticated user
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

    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    logger.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace for the authenticated user
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
    
    const validationResult = workspaceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description = '' } = validationResult.data;

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    });

    logger.info(`User ${session.user.id} created workspace ${workspace.id}`);
    
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    logger.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
