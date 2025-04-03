'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Types for tool management
interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'web_browsing' | 'code_execution' | 'file_system' | 'database' | 'external_api' | 'data_processing' | 'visualization';
  enabled: boolean;
  config?: Record<string, any>;
}

// Agent types for tool assignment
interface Agent {
  id: string;
  name: string;
  role: string;
  tools: string[]; // Array of tool IDs assigned to this agent
}

export default function ToolsPage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<Tool[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'code' | 'file' | 'database' | 'api' | 'processing' | 'visualization'>('all');
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockTools: Tool[] = [
      {
        id: 'web_browser',
        name: 'Web Browser',
        description: 'Browse the web, search for information, and interact with websites',
        category: 'web_browsing',
        enabled: true
      },
      {
        id: 'code_execution',
        name: 'Code Execution',
        description: 'Execute code in various programming languages in a secure environment',
        category: 'code_execution',
        enabled: true
      },
      {
        id: 'file_system',
        name: 'File System',
        description: 'Create, read, update, and delete files in the workspace storage area',
        category: 'file_system',
        enabled: true
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Perform database operations using Prisma ORM',
        category: 'database',
        enabled: false
      },
      {
        id: 'external_api',
        name: 'External API',
        description: 'Interact with external APIs',
        category: 'external_api',
        enabled: false
      }
    ];
    
    const mockAgents: Agent[] = [
      {
        id: '1',
        name: 'Controller Agent',
        role: 'Orchestrator',
        tools: ['web_browser', 'file_system']
      },
      {
        id: '2',
        name: 'Research Agent',
        role: 'Information Gatherer',
        tools: ['web_browser']
      },
      {
        id: '3',
        name: 'Coder Agent',
        role: 'Developer',
        tools: ['code_execution', 'file_system']
      }
    ];
    
    setTools(mockTools);
    setAgents(mockAgents);
    setIsLoading(false);
  }, []);
  
  // Filter tools by category
  const filteredTools = activeTab === 'all' 
    ? tools 
    : tools.filter(tool => {
        switch (activeTab) {
          case 'web': return tool.category === 'web_browsing';
          case 'code': return tool.category === 'code_execution';
          case 'file': return tool.category === 'file_system';
          case 'database': return tool.category === 'database';
          case 'api': return tool.category === 'external_api';
          case 'processing': return tool.category === 'data_processing';
          case 'visualization': return tool.category === 'visualization';
          default: return true;
        }
      });
  
  // Toggle tool enabled status
  const toggleToolStatus = (toolId: string) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId 
          ? { ...tool, enabled: !tool.enabled } 
          : tool
      )
    );
  };
  
  // Assign tool to agent
  const assignToolToAgent = (agentId: string, toolId: string) => {
    setAgents(prevAgents => 
      prevAgents.map(agent => {
        if (agent.id === agentId) {
          // Add tool if not already assigned, remove if already assigned
          const hasToolAssigned = agent.tools.includes(toolId);
          const updatedTools = hasToolAssigned
            ? agent.tools.filter(id => id !== toolId)
            : [...agent.tools, toolId];
          return { ...agent, tools: updatedTools };
        }
        return agent;
      })
    );
  };
  
  // Check if a tool is assigned to an agent
  const isToolAssignedToAgent = (agentId: string, toolId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.tools.includes(toolId) : false;
  };
  
  // Get tool details by ID
  const getToolById = (toolId: string) => {
    return tools.find(tool => tool.id === toolId);
  };
  
  // Tool category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web_browsing': return '🌐';
      case 'code_execution': return '💻';
      case 'file_system': return '📁';
      case 'database': return '🗄️';
      case 'external_api': return '🔌';
      case 'data_processing': return '📊';
      case 'visualization': return '📈';
      default: return '🔧';
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-secondaryBackground p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primaryText">Tool Management</h1>
        <button className="flex items-center rounded-md bg-accentBlue px-4 py-2 text-white hover:bg-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Custom Tool
        </button>
      </div>

      {/* Tool category filter tabs */}
      <div className="mb-6 flex space-x-1 overflow-x-auto border-b border-borderPrimary">
        <button
          onClick={() => setActiveTab('all')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'all'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          All Tools
        </button>
        <button
          onClick={() => setActiveTab('web')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'web'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Web Browsing
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'code'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Code Execution
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'file'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          File System
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'database'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Database
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'api'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          External APIs
        </button>
      </div>

      {/* Main content area with tools and agents */}
      <div className="flex flex-1 flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
        {/* Tool list */}
        <div className="w-full rounded-lg border border-borderPrimary bg-tertiaryBackground p-4 md:w-1/2">
          <h2 className="mb-4 text-xl font-semibold text-primaryText">Available Tools</h2>
          
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accentBlue"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTools.length === 0 ? (
                <p className="text-center text-secondaryText">No tools found in this category</p>
              ) : (
                filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`cursor-pointer rounded-lg border border-borderPrimary p-4 transition-all hover:border-accentBlue ${
                      selectedTool?.id === tool.id ? 'border-accentBlue bg-quaternaryBackground' : 'bg-tertiaryBackground'
                    }`}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 text-2xl">
                          {getCategoryIcon(tool.category)}
                        </div>
                        <div>
                          <h3 className="font-medium text-primaryText">{tool.name}</h3>
                          <p className="text-sm text-secondaryText">{tool.description}</p>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={tool.enabled}
                            onChange={() => toggleToolStatus(tool.id)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-quaternaryBackground after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accentBlue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Agent assignment and tool configuration */}
        <div className="w-full space-y-6 md:w-1/2">
          {/* Agent tool assignment */}
          <div className="rounded-lg border border-borderPrimary bg-tertiaryBackground p-4">
            <h2 className="mb-4 text-xl font-semibold text-primaryText">Tool Assignment</h2>
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-secondaryText">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full rounded-md border border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
              >
                <option value="">Select an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedAgent && (
              <div className="space-y-3">
                <h3 className="font-medium text-primaryText">Assigned Tools</h3>
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between rounded-md border border-borderPrimary bg-quaternaryBackground p-3"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-xl">
                        {getCategoryIcon(tool.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-primaryText">{tool.name}</h4>
                      </div>
                    </div>
                    <div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          disabled={!tool.enabled}
                          checked={isToolAssignedToAgent(selectedAgent, tool.id)}
                          onChange={() => assignToolToAgent(selectedAgent, tool.id)}
                        />
                        <div className={`peer h-6 w-11 rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-accentBlue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none ${
                          !tool.enabled ? 'bg-gray-600 opacity-50' : 'bg-quaternaryBackground'
                        }`}></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Tool configuration */}
          {selectedTool && (
            <div className="rounded-lg border border-borderPrimary bg-tertiaryBackground p-4">
              <h2 className="mb-4 text-xl font-semibold text-primaryText">Tool Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Tool Name
                  </label>
                  <input
                    type="text"
                    value={selectedTool.name}
                    readOnly
                    className="w-full rounded-md border border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Category
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-xl">{getCategoryIcon(selectedTool.category)}</span>
                    <span className="text-primaryText">
                      {selectedTool.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Description
                  </label>
                  <textarea
                    value={selectedTool.description}
                    readOnly
                    rows={3}
                    className="w-full rounded-md border border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  ></textarea>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTool.enabled}
                      onChange={() => toggleToolStatus(selectedTool.id)}
                      className="h-4 w-4 rounded border-gray-300 text-accentBlue focus:ring-accentBlue"
                    />
                    <span className="ml-2 text-primaryText">Tool Enabled</span>
                  </label>
                </div>
                
                <div className="pt-4">
                  <h3 className="mb-3 text-md font-medium text-primaryText">Advanced Settings</h3>
                  
                  {selectedTool.category === 'web_browsing' && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-secondaryText">
                          Default Search Engine
                        </label>
                        <select
                          className="w-full rounded-md border border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                          defaultValue="google"
                        >
                          <option value="google">Google</option>
                          <option value="bing">Bing</option>
                          <option value="duckduckgo">DuckDuckGo</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-accentBlue focus:ring-accentBlue"
                            defaultChecked
                          />
                          <span className="ml-2 text-primaryText">Allow JavaScript execution</span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {selectedTool.category === 'code_execution' && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-secondaryText">
                          Execution Timeout (seconds)
                        </label>
                        <input
                          type="number"
                          className="w-full rounded-md border border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                          defaultValue={5}
                          min={1}
                          max={30}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-secondaryText">
                          Allowed Languages
                        </label>
                        <div className="space-y-2">
                          {['JavaScript', 'TypeScript', 'Python', 'Bash'].map((lang) => (
                            <label key={lang} className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-accentBlue focus:ring-accentBlue"
                                defaultChecked
                              />
                              <span className="ml-2 text-primaryText">{lang}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTool.category === 'file_system' && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-secondaryText">
                          Base Storage Path
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                          defaultValue="./storage"
                        />
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-accentBlue focus:ring-accentBlue"
                            defaultChecked
                          />
                          <span className="ml-2 text-primaryText">Allow file deletion</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <button className="rounded-md bg-accentBlue px-4 py-2 font-medium text-white hover:bg-blue-600">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
