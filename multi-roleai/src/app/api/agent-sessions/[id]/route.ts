import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { agentSessionService } from '@/services/agentSessionService';

/**
 * GET /api/agent-sessions/[id]
 * Get a specific agent session by ID
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

    const agentSession = await agentSessionService.getSession(params.id);
    
    if (!agentSession) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this session
    if (agentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(agentSession);
  } catch (error) {
    console.error('Error fetching agent session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent session' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agent-sessions/[id]
 * Update the status of an agent session
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

    const agentSession = await agentSessionService.getSession(params.id);
    
    if (!agentSession) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this session
    if (agentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { status } = await request.json();
    
    if (!['ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updatedSession = await agentSessionService.updateSessionStatus(
      params.id,
      status
    );
    
    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating agent session:', error);
    return NextResponse.json(
      { error: 'Failed to update agent session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agent-sessions/[id]
 * Delete an agent session (not actually deleting, just marking as archived)
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

    const agentSession = await agentSessionService.getSession(params.id);
    
    if (!agentSession) {
      return NextResponse.json(
        { error: 'Agent session not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this session
    if (agentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // We're not actually deleting the session, just marking it as completed
    const updatedSession = await agentSessionService.updateSessionStatus(
      params.id,
      'COMPLETED'
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent session:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent session' },
      { status: 500 }
    );
  }
}
