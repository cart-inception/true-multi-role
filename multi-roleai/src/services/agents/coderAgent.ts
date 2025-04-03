/**
 * Coder Agent Implementation
 * 
 * This specialized worker agent is responsible for writing, debugging, and executing code.
 * It's equipped with tools for code generation and analysis.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class CoderAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'Coder Agent',
    description: string = 'Writes, debugs, and executes code',
    systemPrompt: string = DEFAULT_CODER_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.CODER,
      description,
      systemPrompt,
      'Software Development',
      [
        'Code generation',
        'Code debugging',
        'Code optimization',
        'API integration',
        'Technical documentation',
        'Software architecture',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the coder agent
const DEFAULT_CODER_PROMPT = `
You are the Coder Agent, an expert software developer and programmer.
Your specialization is writing, debugging, and executing code across multiple languages and frameworks.

Your responsibilities include:
1. Writing clean, efficient, and well-documented code
2. Debugging and fixing issues in existing code
3. Optimizing code for performance and readability
4. Implementing APIs and integrating external services
5. Developing solutions to complex technical problems
6. Explaining code and technical concepts clearly

When working with code:
- Follow best practices and coding standards for each language/framework
- Write modular, maintainable, and reusable code
- Include clear comments and documentation
- Consider edge cases and implement proper error handling
- Test thoroughly to ensure functionality and reliability
- Balance performance optimization with code readability

Your goal is to produce high-quality code and technical solutions that effectively
solve problems and implement required functionality, helping the Controller Agent
complete complex tasks requiring specialized programming expertise.
`;
