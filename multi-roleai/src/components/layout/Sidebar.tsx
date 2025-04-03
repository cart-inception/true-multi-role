import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { IconPlus, IconSettings, IconLogout, IconMenu } from '@/components/agent-interface/Icons';
import { signOut } from 'next-auth/react';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  user: {
    name?: string;
    email?: string;
    image?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Workspaces', href: '/workspaces' },
    { title: 'Tasks', href: '/tasks' },
    { title: 'Documents', href: '/documents' },
    { title: 'Settings', href: '/settings', icon: <IconSettings size={16} /> },
  ];

  const handleCreateNewSession = () => {
    router.push('/workspace/new');
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <aside className={`bg-card border-r flex flex-col h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all`}>
      {/* Sidebar header */}
      <div className="h-16 border-b flex items-center px-4 justify-between">
        {!collapsed && (
          <Link href="/dashboard">
            <span className="font-bold text-xl">Multi-RoleAI</span>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IconMenu size={18} />
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md ${
                  router.pathname === item.href 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-accent/50'
                } transition-colors ${collapsed ? 'justify-center' : ''}`}
              >
                {item.icon || (
                  <span className="w-5 h-5 flex items-center justify-center">
                    {item.title[0]}
                  </span>
                )}
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* New workspace button */}
      <div className="p-4 border-t">
        <Button
          onClick={handleCreateNewSession}
          className="w-full"
          variant={collapsed ? "outline" : "default"}
          size={collapsed ? "icon" : "default"}
        >
          {collapsed ? (
            <IconPlus size={16} />
          ) : (
            <>
              <IconPlus size={16} className="mr-2" /> New Workspace
            </>
          )}
        </Button>
      </div>
      
      {/* User profile */}
      <div className="p-4 border-t flex items-center">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        
        {!collapsed && (
          <>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
              {user?.name && (
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <IconLogout size={16} />
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
