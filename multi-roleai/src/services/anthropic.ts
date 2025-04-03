/**
 * Anthropic Claude API Integration Service
 * 
 * This service provides methods to interact with the Anthropic Claude API
 * for implementing AI agent capabilities in Multi-RoleAI.
 */

import { AgentMessage, AgentRole, MessageContent } from '@/types/agent';

// Constants
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219'; // Using Claude 3.7 Sonnet

export interface AnthropicRequestOptions {
  temperature?: number;
  maxTokens?: number;
  system?: string;
  tools?: any[];
  stream?: boolean;
}

export class AnthropicService {
  private apiKey: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Anthropic API key is not set. API calls will fail.');
    }
  }
  
  /**
   * Sends a message to Claude API and returns the response
   */
  async sendMessage(
    messages: AgentMessage[],
    options: AnthropicRequestOptions = {}
  ): Promise<AgentMessage> {
    try {
      const { temperature = 0.7, maxTokens = 4096, system, tools, stream = false } = options;
      
      // Format messages for Anthropic API
      const formattedMessages = messages.map(msg => ({
        role: msg.role === AgentRole.USER ? 'user' : 'assistant',
        content: this.formatMessageContent(msg.content),
      }));
      
      const requestBody = {
        model: CLAUDE_MODEL,
        messages: formattedMessages,
        max_tokens: maxTokens,
        temperature,
        stream,
      };
      
      // Add system prompt if provided
      if (system) {
        requestBody.system = system;
      }
      
      // Add tools if provided
      if (tools && tools.length > 0) {
        requestBody.tools = tools;
      }
      
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Format the response into our AgentMessage format
      return {
        id: data.id,
        role: AgentRole.ASSISTANT,
        content: data.content,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }
  
  /**
   * Formats message content to match Anthropic API requirements
   */
  private formatMessageContent(content: MessageContent): any[] {
    if (typeof content === 'string') {
      return [{ type: 'text', text: content }];
    }
    
    // For array content, convert to Anthropic format
    return Array.isArray(content) 
      ? content.map(item => {
          if (typeof item === 'string') {
            return { type: 'text', text: item };
          }
          return item;
        })
      : [{ type: 'text', text: String(content) }];
  }
  
  /**
   * Sends a streaming message to Claude API
   */
  async streamMessage(
    messages: AgentMessage[],
    onChunk: (chunk: any) => void,
    options: AnthropicRequestOptions = {}
  ): Promise<void> {
    try {
      const streamOptions = { ...options, stream: true };
      const formattedMessages = messages.map(msg => ({
        role: msg.role === AgentRole.USER ? 'user' : 'assistant',
        content: this.formatMessageContent(msg.content),
      }));
      
      const requestBody = {
        model: CLAUDE_MODEL,
        messages: formattedMessages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        stream: true,
      };
      
      // Add system prompt if provided
      if (options.system) {
        requestBody.system = options.system;
      }
      
      // Add tools if provided
      if (options.tools && options.tools.length > 0) {
        requestBody.tools = options.tools;
      }
      
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('Stream not available');
      }
      
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsedData = JSON.parse(data);
              onChunk(parsedData);
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming from Anthropic API:', error);
      throw error;
    }
  }
}
