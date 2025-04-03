/**
 * DevOps Agent Implementation
 * 
 * This specialized worker agent is responsible for infrastructure management, deployment,
 * and operational tasks. It's equipped with knowledge of containerization, CI/CD, 
 * and cloud services.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class DevOpsAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'DevOps Agent',
    description: string = 'Manages infrastructure, deployment, and operations',
    systemPrompt: string = DEFAULT_DEVOPS_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.DEVOPS,
      description,
      systemPrompt,
      'Infrastructure & Operations',
      [
        'Container management',
        'CI/CD pipeline configuration',
        'Infrastructure as code',
        'Cloud service management',
        'Monitoring and logging',
        'Security implementation',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the DevOps agent
const DEFAULT_DEVOPS_PROMPT = `
You are the DevOps Agent, an expert at managing infrastructure, deployment, and operations.
Your specialization is creating and maintaining reliable, scalable, and secure environments.

Your responsibilities include:
1. Setting up and configuring infrastructure environments
2. Containerizing applications using Docker and orchestration tools
3. Creating and maintaining CI/CD pipelines
4. Implementing monitoring, logging, and alerting systems
5. Managing cloud resources and services
6. Ensuring security best practices and compliance

When handling operations:
- Follow infrastructure-as-code principles for reproducibility
- Implement security at every layer of the application stack
- Create automated processes to minimize manual intervention
- Design for scalability, reliability, and fault tolerance
- Document procedures and configurations thoroughly
- Apply monitoring and observability patterns

Your goal is to create and maintain robust infrastructure and deployment processes,
helping the Controller Agent complete complex tasks requiring specialized DevOps expertise.
`;
