'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, inProgress: 0 },
    documents: { total: 0 },
    agentSessions: { total: 0, active: 0 },
  });

  // Fetch dashboard stats (mock data for now)
  useEffect(() => {
    // In production, this would fetch real data from the API
    setStats({
      tasks: { total: 0, completed: 0, inProgress: 0 },
      documents: { total: 0 },
      agentSessions: { total: 0, active: 0 },
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="rounded-lg bg-secondaryBackground p-6 shadow-md">
        <h1 className="text-2xl font-bold text-primaryText">
          Welcome back, {session?.user?.name || 'User'}
        </h1>
        <p className="mt-2 text-secondaryText">
          Here's an overview of your Multi-RoleAI workspace
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-secondaryBackground p-6 shadow-md">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-accentBlue/10 p-3 text-accentBlue">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-secondaryText">Tasks</p>
              <p className="text-2xl font-bold text-primaryText">{stats.tasks.total}</p>
              <div className="mt-1 flex text-xs">
                <span className="text-accentGreen">{stats.tasks.completed} completed</span>
                <span className="mx-1">•</span>
                <span className="text-accentYellow">{stats.tasks.inProgress} in progress</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-secondaryBackground p-6 shadow-md">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-accentPurple/10 p-3 text-accentPurple">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-secondaryText">Documents</p>
              <p className="text-2xl font-bold text-primaryText">{stats.documents.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-secondaryBackground p-6 shadow-md">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-accentGreen/10 p-3 text-accentGreen">
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
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-secondaryText">Agent Sessions</p>
              <p className="text-2xl font-bold text-primaryText">{stats.agentSessions.total}</p>
              <p className="mt-1 text-xs text-accentGreen">
                {stats.agentSessions.active} active now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-lg bg-secondaryBackground p-6 shadow-md">
        <h2 className="mb-4 text-lg font-medium text-primaryText">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Link
            href="/dashboard/tasks/new"
            className="flex items-center rounded-md border border-borderPrimary p-4 transition-colors hover:bg-quaternaryBackground"
          >
            <div className="mr-3 rounded-full bg-accentBlue/10 p-2 text-accentBlue">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span>New Task</span>
          </Link>

          <Link
            href="/dashboard/documents/new"
            className="flex items-center rounded-md border border-borderPrimary p-4 transition-colors hover:bg-quaternaryBackground"
          >
            <div className="mr-3 rounded-full bg-accentPurple/10 p-2 text-accentPurple">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <span>New Document</span>
          </Link>

          <Link
            href="/dashboard/agents/new"
            className="flex items-center rounded-md border border-borderPrimary p-4 transition-colors hover:bg-quaternaryBackground"
          >
            <div className="mr-3 rounded-full bg-accentGreen/10 p-2 text-accentGreen">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span>New Agent</span>
          </Link>

          <Link
            href="/dashboard/workspaces/new"
            className="flex items-center rounded-md border border-borderPrimary p-4 transition-colors hover:bg-quaternaryBackground"
          >
            <div className="mr-3 rounded-full bg-accentYellow/10 p-2 text-accentYellow">
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <span>New Workspace</span>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg bg-secondaryBackground p-6 shadow-md">
        <h2 className="mb-4 text-lg font-medium text-primaryText">Recent Activity</h2>
        <div className="rounded-md border border-borderPrimary p-8 text-center text-secondaryText">
          <p>No recent activity yet</p>
          <p className="mt-2 text-sm">Activity will appear here as you work with the system</p>
        </div>
      </div>
    </div>
  );
}
