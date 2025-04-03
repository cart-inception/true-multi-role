import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { agentSessionService } from '@/services/agentSessionService';
import { AgentRole } from '@/types/agent';

/**
 * GET /api/agent-sessions/[id]/messages
 * Get messages for a specific agent session
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
    
    return NextResponse.json(agentSession.history || []);
  } catch (error) {
    console.error('Error fetching agent session messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent session messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent-sessions/[id]/messages
 * Send a message to an agent session and get a response
 */
export async function POST(
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

    // Check if the session is active
    if (agentSession.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Agent session is not active' },
        { status: 400 }
      );
    }

    const { content, role = AgentRole.USER } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Process the message with the agent
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const response = await agentSessionService.processUserMessage(
        params.id,
        content,
        apiKey
      );
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error processing message with agent:', error);
      return NextResponse.json(
        { error: 'Failed to process message with agent' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending message to agent session:', error);
    return NextResponse.json(
      { error: 'Failed to send message to agent session' },
      { status: 500 }
    );
  }
}
