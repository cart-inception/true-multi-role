import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { IconPlus, IconFolder, IconEdit, IconTrash } from '@/components/agent-interface/Icons';

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function WorkspacesPage() {
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
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
        description: 'Failed to load workspaces',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      toast({
        title: 'Success',
        description: 'Workspace deleted successfully',
      });

      // Refresh the workspace list
      fetchWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete workspace',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <Link href="/dashboard/workspaces/new">
          <Button>
            <IconPlus className="mr-2" size={16} />
            New Workspace
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <IconFolder size={48} className="text-gray-400" />
            <h3 className="text-lg font-medium">No workspaces found</h3>
            <p className="text-gray-500 mb-4">Create your first workspace to get started</p>
            <Link href="/dashboard/workspaces/new">
              <Button variant="outline">
                <IconPlus className="mr-2" size={16} />
                Create Workspace
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <IconFolder size={24} className="text-primary mr-3" />
                  <div>
                    <h3 className="text-lg font-medium">{workspace.name}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {workspace.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/workspaces/${workspace.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <IconEdit size={16} />
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteWorkspace(workspace.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Created on {new Date(workspace.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-2">
                <Link href={`/dashboard/workspaces/${workspace.id}`}>
                  <Button variant="outline" className="w-full">View Workspace</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
