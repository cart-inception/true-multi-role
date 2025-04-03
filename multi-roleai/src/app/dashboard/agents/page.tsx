import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { IconPlus, IconRobot, IconEdit, IconTrash } from '@/components/agent-interface/Icons';
import { AgentRole } from '@/types/agent';

interface Agent {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get role display name
const getRoleDisplayName = (role: AgentRole): string => {
  switch (role) {
    case AgentRole.CONTROLLER:
      return 'Controller Agent';
    case AgentRole.RESEARCHER:
      return 'Research Agent';
    case AgentRole.WRITER:
      return 'Writer Agent';
    case AgentRole.CODER:
      return 'Coder Agent';
    case AgentRole.ANALYST:
      return 'Data Analyst Agent';
    case AgentRole.DESIGNER:
      return 'Designer Agent';
    case AgentRole.DEVOPS:
      return 'DevOps Agent';
    case AgentRole.SECURITY:
      return 'Security Agent';
    default:
      return role;
  }
};

// Helper function to get role badge color
const getRoleBadgeColor = (role: AgentRole): string => {
  switch (role) {
    case AgentRole.CONTROLLER:
      return 'bg-blue-100 text-blue-800';
    case AgentRole.RESEARCHER:
      return 'bg-purple-100 text-purple-800';
    case AgentRole.WRITER:
      return 'bg-green-100 text-green-800';
    case AgentRole.CODER:
      return 'bg-yellow-100 text-yellow-800';
    case AgentRole.ANALYST:
      return 'bg-indigo-100 text-indigo-800';
    case AgentRole.DESIGNER:
      return 'bg-pink-100 text-pink-800';
    case AgentRole.DEVOPS:
      return 'bg-orange-100 text-orange-800';
    case AgentRole.SECURITY:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AgentsPage() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      toast({
        title: 'Success',
        description: 'Agent deleted successfully',
      });

      // Refresh the agent list
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Link href="/dashboard/agents/new">
          <Button>
            <IconPlus className="mr-2" size={16} />
            New Agent
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : agents.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <IconRobot size={48} className="text-gray-400" />
            <h3 className="text-lg font-medium">No agents found</h3>
            <p className="text-gray-500 mb-4">Create your first agent to get started</p>
            <Link href="/dashboard/agents/new">
              <Button variant="outline">
                <IconPlus className="mr-2" size={16} />
                Create Agent
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <IconRobot size={24} className="text-primary mr-3" />
                  <div>
                    <h3 className="text-lg font-medium">{agent.name}</h3>
                    <Badge className={`mt-1 ${getRoleBadgeColor(agent.role)}`}>
                      {getRoleDisplayName(agent.role)}
                    </Badge>
                    <p className="text-sm text-gray-500 truncate max-w-[200px] mt-1">
                      {agent.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/agents/${agent.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <IconEdit size={16} />
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Created on {new Date(agent.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-2">
                <Link href={`/dashboard/agents/${agent.id}`}>
                  <Button variant="outline" className="w-full">Start Chat</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
