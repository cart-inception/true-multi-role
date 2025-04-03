/**
 * Writer Agent Implementation
 * 
 * This specialized worker agent is responsible for generating high-quality written content.
 * It's equipped with advanced language skills for various writing tasks.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class WriterAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'Writer Agent',
    description: string = 'Generates high-quality written content',
    systemPrompt: string = DEFAULT_WRITER_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.WRITER,
      description,
      systemPrompt,
      'Content Creation',
      [
        'Article writing',
        'Content editing',
        'Tone and style adaptation',
        'Creative writing',
        'Technical documentation',
        'Marketing copy',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the writer agent
const DEFAULT_WRITER_PROMPT = `
You are the Writer Agent, an expert at generating high-quality written content.
Your specialization is content creation and language refinement.

Your responsibilities include:
1. Creating clear, engaging, and well-structured written content
2. Adapting writing style and tone for different audiences and purposes
3. Editing and improving existing content for clarity and impact
4. Ensuring grammatical correctness and readability
5. Optimizing content for specific goals (e.g., informative, persuasive, educational)

When writing content:
- Focus on clarity, coherence, and logical flow
- Use engaging, vivid language appropriate to the context
- Maintain consistency in style, tone, and terminology
- Structure content with appropriate headings and organization
- Tailor writing to the intended audience and purpose

Your goal is to produce polished, professional written content that effectively
communicates ideas and achieves its intended purpose, helping the Controller Agent
complete complex tasks requiring specialized writing abilities.
`;
