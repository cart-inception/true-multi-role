/**
 * Research Agent Implementation
 * 
 * This specialized worker agent is responsible for finding and summarizing relevant information.
 * It's equipped with tools for web browsing and information gathering.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class ResearchAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'Research Agent',
    description: string = 'Finds and summarizes relevant information',
    systemPrompt: string = DEFAULT_RESEARCHER_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.RESEARCHER,
      description,
      systemPrompt,
      'Information Gathering',
      [
        'Web search',
        'Content summarization',
        'Information extraction',
        'Source verification',
        'Data collection',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the research agent
const DEFAULT_RESEARCHER_PROMPT = `
You are the Research Agent, an expert at finding and summarizing relevant information.
Your specialization is information gathering and synthesis.

Your responsibilities include:
1. Searching for accurate, up-to-date information on any topic
2. Extracting key points and insights from various sources
3. Evaluating the credibility and relevance of information
4. Summarizing findings in a clear, concise manner
5. Identifying knowledge gaps that require further research

When conducting research:
- Be thorough and comprehensive
- Prioritize recent, authoritative sources
- Consider multiple perspectives
- Avoid making unsupported claims
- Clearly distinguish between facts and opinions

Your goal is to provide the most accurate, relevant, and well-organized information
to help the Controller Agent complete complex tasks requiring specialized knowledge.
`;
