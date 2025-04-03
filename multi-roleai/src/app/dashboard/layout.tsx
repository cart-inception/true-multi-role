'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Workspaces', href: '/dashboard/workspaces', icon: 'folder' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: 'check-square' },
    { name: 'Documents', href: '/dashboard/documents', icon: 'file-text' },
    { name: 'Agents', href: '/dashboard/agents', icon: 'cpu' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-primaryBackground text-primaryText">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-tertiaryBackground transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-borderPrimary px-4">
          <h1 className="text-xl font-bold text-accentBlue">Multi-RoleAI</h1>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 text-secondaryText hover:bg-quaternaryBackground md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-md px-4 py-2 text-sm ${
                    pathname === item.href
                      ? 'bg-quaternaryBackground text-accentBlue'
                      : 'text-secondaryText hover:bg-quaternaryBackground'
                  }`}
                >
                  <span className="mr-3">
                    <i className={`feather-${item.icon}`}></i>
                  </span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile */}
        <div className="border-t border-borderPrimary p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-accentBlue">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-accentBlue text-sm font-medium text-primaryText">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-secondaryText">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="ml-auto rounded-md p-1 text-secondaryText hover:bg-quaternaryBackground"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center border-b border-borderPrimary bg-secondaryBackground px-4">
          <button
            onClick={toggleSidebar}
            className="mr-4 rounded-md p-1 text-secondaryText hover:bg-quaternaryBackground md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-lg font-medium">
            {navItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
          </h2>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {status === 'loading' ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accentBlue"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
