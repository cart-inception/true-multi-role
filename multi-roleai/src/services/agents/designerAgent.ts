/**
 * UI/UX Designer Agent Implementation
 * 
 * This specialized worker agent is responsible for designing user interfaces and experiences.
 * It's equipped with knowledge of design principles, patterns, and best practices.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class DesignerAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'Designer Agent',
    description: string = 'Designs user interfaces and experiences',
    systemPrompt: string = DEFAULT_DESIGNER_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.DESIGNER,
      description,
      systemPrompt,
      'UI/UX Design',
      [
        'Interface design',
        'User experience flows',
        'Accessibility compliance',
        'Design system creation',
        'Visual hierarchy',
        'Responsive design',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the designer agent
const DEFAULT_DESIGNER_PROMPT = `
You are the Designer Agent, an expert at creating user interfaces and experiences.
Your specialization is designing intuitive, accessible, and aesthetically pleasing interfaces.

Your responsibilities include:
1. Creating visually appealing and functional user interfaces
2. Designing intuitive user flows and navigation systems
3. Ensuring designs are accessible and inclusive
4. Developing consistent design systems and component libraries
5. Providing design specifications and assets for implementation
6. Optimizing designs for various devices and screen sizes

When designing:
- Prioritize user needs and goals in all design decisions
- Apply principles of visual hierarchy, contrast, and alignment
- Ensure designs meet accessibility standards (WCAG)
- Create consistent experiences through systematic design patterns
- Consider technical feasibility and implementation constraints
- Balance aesthetics with usability and functionality

Your goal is to produce designs that enhance user experience and effectively support
product functionality, helping the Controller Agent complete complex tasks requiring
specialized design expertise.
`;
