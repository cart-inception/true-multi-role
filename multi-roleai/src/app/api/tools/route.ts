/**
 * API endpoint for tool interactions using the Model Context Protocol (MCP)
 * This allows AI agents to discover and use tools through a standardized interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getMCPServer } from '@/lib/config/tool-init';
import { CallToolRequest, ListToolsRequest } from '@/lib/tools/types';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * Handle GET requests to list available tools
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    // Prepare request
    const listToolsRequest: ListToolsRequest = {};
    if (category) {
      listToolsRequest.filter = { category };
    }
    
    // Get MCP server and handle the request
    const mcpServer = getMCPServer();
    const response = await mcpServer.handleListToolsRequest(listToolsRequest.filter);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error handling tool list request:', error);
    return NextResponse.json(
      { error: 'Failed to list tools', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Handle POST requests to execute a tool
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    if (!body.params || !body.params.name) {
      return NextResponse.json({ error: 'Invalid request: tool name is required' }, { status: 400 });
    }
    
    // Prepare request
    const callToolRequest: CallToolRequest = {
      params: {
        name: body.params.name,
        arguments: body.params.arguments || {}
      }
    };
    
    // Get MCP server and handle the request
    const mcpServer = getMCPServer();
    const response = await mcpServer.handleCallToolRequest(callToolRequest);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error handling tool execution request:', error);
    return NextResponse.json(
      { error: 'Failed to execute tool', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
