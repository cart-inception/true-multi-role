import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ChatMessage } from './ChatMessage';
import { AgentMessage, AgentRole } from '@/types/agent';
import { IconSend, IconRefresh, IconMicrophone, IconStop } from './Icons';

interface ChatInterfaceProps {
  sessionId: string;
  messages: AgentMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onReset: () => void;
  isProcessing: boolean;
  error?: string;
}

export function ChatInterface({
  sessionId,
  messages,
  onSendMessage,
  onReset,
  isProcessing,
  error,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (input.trim() && !isProcessing) {
      const content = input.trim();
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      await onSendMessage(content);
    }
  };

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle voice recording (placeholder functionality)
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop voice recording
    // and use speech-to-text to convert to input
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-2xl font-bold mb-2">Welcome to Multi-RoleAI</h3>
            <p className="text-muted-foreground mb-6">
              Start a conversation with our specialized AI agents to help with your tasks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {[
                {
                  title: 'Research',
                  description: 'Find information and summarize content',
                  prompt: 'Research the latest advancements in quantum computing',
                },
                {
                  title: 'Write',
                  description: 'Create and edit written content',
                  prompt: 'Write a blog post about sustainable technology',
                },
                {
                  title: 'Code',
                  description: 'Generate and debug code',
                  prompt: 'Create a React component for a dropdown menu',
                },
                {
                  title: 'Analyze Data',
                  description: 'Process and visualize data',
                  prompt: 'Analyze this sales data and create visualizations',
                },
              ].map((suggestion, index) => (
                <button
                  key={index}
                  className="flex flex-col items-start p-4 border rounded-lg hover:bg-accent/50 transition-colors text-left"
                  onClick={() => setInput(suggestion.prompt)}
                >
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
                Error: {error}
              </div>
            )}
          </>
        )}
        {/* Invisible element for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="icon"
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              aria-label="Send message"
            >
              <IconSend />
            </Button>
            
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={toggleRecording}
              disabled={isProcessing}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
              className={isRecording ? "bg-destructive/10 text-destructive border-destructive" : ""}
            >
              {isRecording ? <IconStop /> : <IconMicrophone />}
            </Button>
          </div>
        </div>
        
        {/* Actions row */}
        <div className="flex justify-between mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs"
          >
            <IconRefresh className="mr-1 h-3 w-3" />
            Reset conversation
          </Button>
          
          {isProcessing && (
            <span className="text-xs text-muted-foreground animate-pulse">
              AI is thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
