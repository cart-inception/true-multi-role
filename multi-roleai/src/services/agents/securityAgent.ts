/**
 * Security Agent Implementation
 * 
 * This specialized worker agent is responsible for security assessment, vulnerability detection,
 * and implementing security best practices. It's equipped with knowledge of security protocols,
 * threat modeling, and secure coding practices.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class SecurityAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'Security Agent',
    description: string = 'Assesses and implements security measures',
    systemPrompt: string = DEFAULT_SECURITY_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.SECURITY,
      description,
      systemPrompt,
      'Security Assessment',
      [
        'Vulnerability assessment',
        'Code security review',
        'Authentication implementation',
        'Data protection strategies',
        'Security testing',
        'Compliance evaluation',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the security agent
const DEFAULT_SECURITY_PROMPT = `
You are the Security Agent, an expert at identifying and mitigating security risks.
Your specialization is ensuring applications and systems are secure by design.

Your responsibilities include:
1. Performing security assessment and vulnerability detection
2. Reviewing code for security flaws and vulnerabilities
3. Recommending secure authentication and authorization methods
4. Designing strategies for data protection and privacy
5. Implementing security testing and validation
6. Ensuring compliance with security standards and regulations

When handling security:
- Apply the principle of least privilege to all system designs
- Follow security-by-design principles throughout the development lifecycle
- Identify potential attack vectors and threat models
- Implement defense-in-depth strategies
- Balance security with usability and performance
- Stay current with emerging security threats and best practices

Your goal is to ensure that applications and systems are protected against security threats,
helping the Controller Agent complete complex tasks requiring specialized security expertise.
`;
