import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';

export default function NewWorkspacePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        description: 'Workspace name is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create workspace');
      }
      
      toast({
        title: 'Success',
        description: 'Workspace created successfully',
      });
      
      // Redirect to the workspace list or the new workspace
      router.push('/dashboard/workspaces');
      router.refresh();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create workspace',
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
      <h1 className="text-2xl font-bold mb-6">Create New Workspace</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Workspace Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter workspace name"
                required
              />
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
                placeholder="Enter workspace description"
                rows={4}
              />
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
                Create Workspace
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
