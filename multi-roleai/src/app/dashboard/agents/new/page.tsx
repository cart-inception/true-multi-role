import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { AgentRole } from '@/types/agent';

// Agent roles available in the system
const agentRoles = [
  { value: AgentRole.CONTROLLER, label: 'Controller Agent' },
  { value: AgentRole.RESEARCHER, label: 'Research Agent' },
  { value: AgentRole.WRITER, label: 'Writer Agent' },
  { value: AgentRole.CODER, label: 'Coder Agent' },
  { value: AgentRole.ANALYST, label: 'Data Analyst Agent' },
  { value: AgentRole.DESIGNER, label: 'Designer Agent' },
  { value: AgentRole.DEVOPS, label: 'DevOps Agent' },
  { value: AgentRole.SECURITY, label: 'Security Agent' },
];

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export default function NewAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: AgentRole.CONTROLLER,
    workspaceId: '',
    systemPrompt: '',
  });

  // Fetch workspaces on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          throw new Error('Failed to fetch workspaces');
        }
        const data = await response.json();
        setWorkspaces(data);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workspaces. Some features may be limited.',
          variant: 'destructive',
        });
      }
    };

    fetchWorkspaces();
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Agent name is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent');
      }
      
      toast({
        title: 'Success',
        description: 'Agent created successfully',
      });
      
      // Redirect to the agent list or the new agent
      router.push('/dashboard/agents');
      router.refresh();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create agent',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Agent</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Agent Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter agent name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1">
                Agent Role *
              </label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {agentRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter agent description"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="workspaceId" className="block text-sm font-medium mb-1">
                Workspace (Optional)
              </label>
              <Select
                id="workspaceId"
                name="workspaceId"
                value={formData.workspaceId}
                onChange={handleChange}
              >
                <option value="">No workspace</option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Assign this agent to a specific workspace
              </p>
            </div>
            
            <div>
              <label htmlFor="systemPrompt" className="block text-sm font-medium mb-1">
                System Prompt
              </label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                value={formData.systemPrompt}
                onChange={handleChange}
                placeholder="Enter system instructions for this agent"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Instructions that define how this agent behaves
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Agent
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
