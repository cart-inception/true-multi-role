import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { agentSessionService } from '@/services/agentSessionService';

/**
 * GET /api/agent-sessions
 * Get all agent sessions for the authenticated user
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
    const agentSessions = await agentSessionService.getUserSessions(userId);
    
    return NextResponse.json(agentSessions);
  } catch (error) {
    console.error('Error fetching agent sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent-sessions
 * Create a new agent session
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
    const { name, taskId } = await request.json();
    
    const newAgentSession = await agentSessionService.createSession(
      userId,
      name,
      taskId
    );
    
    return NextResponse.json(newAgentSession, { status: 201 });
  } catch (error) {
    console.error('Error creating agent session:', error);
    return NextResponse.json(
      { error: 'Failed to create agent session' },
      { status: 500 }
    );
  }
}
