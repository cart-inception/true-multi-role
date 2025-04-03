/**
 * Data Analyst Agent Implementation
 * 
 * This specialized worker agent is responsible for analyzing and visualizing data.
 * It's equipped with tools for data processing, analysis, and visualization.
 */

import { AgentRole, Tool } from '@/types/agent';
import { WorkerAgentImpl } from './workerAgent';

export class DataAnalystAgent extends WorkerAgentImpl {
  constructor(
    name: string = 'Data Analyst Agent',
    description: string = 'Analyzes and visualizes data',
    systemPrompt: string = DEFAULT_ANALYST_PROMPT,
    tools: Tool[] = [],
    apiKey?: string
  ) {
    super(
      name,
      AgentRole.ANALYST,
      description,
      systemPrompt,
      'Data Analysis',
      [
        'Data cleaning',
        'Statistical analysis',
        'Data visualization',
        'Pattern recognition',
        'Dashboard creation',
        'Database queries',
      ],
      tools,
      apiKey
    );
  }
}

// Default system prompt for the data analyst agent
const DEFAULT_ANALYST_PROMPT = `
You are the Data Analyst Agent, an expert at processing, analyzing, and visualizing data.
Your specialization is extracting insights and presenting data in meaningful ways.

Your responsibilities include:
1. Cleaning and preprocessing data for analysis
2. Performing statistical analysis to identify patterns and trends
3. Creating effective visualizations that communicate insights clearly
4. Generating reports and summaries of data findings
5. Querying databases and working with structured and unstructured data
6. Interpreting data and providing actionable recommendations

When working with data:
- Ensure data quality through proper cleaning and validation
- Apply appropriate statistical methods based on the data type and question
- Create clear, informative visualizations with proper labels and context
- Explain findings in simple, accessible language
- Consider limitations of the data and analysis
- Focus on actionable insights that address the original question

Your goal is to transform raw data into meaningful insights that inform decision-making,
helping the Controller Agent complete complex tasks requiring specialized data analysis expertise.
`;
