import React from 'react';
import { cn } from '@/lib/utils';
import { AgentMessage, AgentRole } from '@/types/agent';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: AgentMessage;
  isLast?: boolean;
}

export function ChatMessage({ message, isLast = false }: ChatMessageProps) {
  const isUser = message.role === AgentRole.USER;
  const isSystem = message.role === AgentRole.SYSTEM;
  
  // Format timestamp
  const timestamp = new Date(message.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine the agent name based on role
  const getAgentName = (role: AgentRole): string => {
    switch (role) {
      case AgentRole.USER:
        return 'You';
      case AgentRole.CONTROLLER:
        return 'Controller Agent';
      case AgentRole.RESEARCHER:
        return 'Research Agent';
      case AgentRole.WRITER:
        return 'Writer Agent';
      case AgentRole.CODER:
        return 'Coder Agent';
      case AgentRole.ANALYST:
        return 'Data Analyst Agent';
      case AgentRole.DESIGNER:
        return 'Designer Agent';
      case AgentRole.DEVOPS:
        return 'DevOps Agent';
      case AgentRole.SECURITY:
        return 'Security Agent';
      case AgentRole.SYSTEM:
        return 'System';
      default:
        return 'Assistant';
    }
  };

  return (
    <div
      className={cn(
        'py-3 px-4 mb-2 rounded-lg',
        isUser ? 'bg-primary/10 ml-auto max-w-[85%]' : 'bg-secondary/20 mr-auto max-w-[85%]',
        isSystem && 'bg-muted/50 border border-muted w-full max-w-full text-center italic',
        isLast && 'mb-4'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Agent avatar/icon */}
        {!isUser && (
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {getAgentName(message.role).substring(0, 1)}
          </div>
        )}
        
        <div className="flex-1">
          {/* Message header with name and timestamp */}
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">
              {getAgentName(message.role)}
            </span>
            <span className="text-xs text-muted-foreground">
              {timestamp}
            </span>
          </div>
          
          {/* Message content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {typeof message.content === 'string' ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <pre className="bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(message.content, null, 2)}
              </pre>
            )}
          </div>
        </div>
        
        {/* User avatar position (right side) */}
        {isUser && (
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {getAgentName(message.role).substring(0, 1)}
          </div>
        )}
      </div>
    </div>
  );
}
