'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

// Document types
interface Document {
  id: string;
  name: string;
  type: 'text' | 'code' | 'markdown';
  lastModified: string;
  size: number;
  path: string;
}

// Folder structure
interface Folder {
  id: string;
  name: string;
  path: string;
  children: (Folder | Document)[];
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Project Plan.md',
        type: 'markdown',
        lastModified: '2025-03-28T10:30:00Z',
        size: 1024,
        path: '/'
      },
      {
        id: '2',
        name: 'API Documentation.md',
        type: 'markdown',
        lastModified: '2025-03-29T14:15:00Z',
        size: 2048,
        path: '/'
      },
      {
        id: '3',
        name: 'main.py',
        type: 'code',
        lastModified: '2025-03-30T09:45:00Z',
        size: 512,
        path: '/code/'
      }
    ];
    
    const mockFolders: Folder[] = [
      {
        id: '1',
        name: 'Code',
        path: '/code/',
        children: []
      },
      {
        id: '2',
        name: 'Research',
        path: '/research/',
        children: []
      }
    ];
    
    setDocuments(mockDocuments.filter(doc => doc.path === currentPath));
    setFolders(mockFolders.filter(folder => folder.path.startsWith(currentPath) && folder.path !== currentPath));
    setIsLoading(false);
  }, [currentPath]);
  
  // Navigation functions
  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
  };
  
  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    parts.pop();
    setCurrentPath('/' + parts.join('/') + (parts.length > 0 ? '/' : ''));
  };
  
  // Filter items based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentBuildPath = '/';
    for (const part of parts) {
      currentBuildPath += part + '/';
      breadcrumbs.push({
        name: part,
        path: currentBuildPath
      });
    }
    
    return breadcrumbs;
  };
  
  // File icon mapping
  const getFileIcon = (type: string, name: string) => {
    if (type === 'markdown') return '📄';
    if (type === 'code') {
      if (name.endsWith('.py')) return '🐍';
      if (name.endsWith('.js') || name.endsWith('.ts')) return '📜';
      return '💻';
    }
    return '📄';
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-secondaryBackground p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primaryText">Documents</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('grid')}
            className={`rounded-md p-2 ${
              view === 'grid' ? 'bg-accentBlue text-white' : 'bg-quaternaryBackground text-secondaryText'
            }`}
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className={`rounded-md p-2 ${
              view === 'list' ? 'bg-accentBlue text-white' : 'bg-quaternaryBackground text-secondaryText'
            }`}
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 pl-10 text-primaryText focus:border-accentBlue focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-secondaryText">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="flex space-x-2">
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
            New Document
          </button>
          <button className="flex items-center rounded-md bg-quaternaryBackground px-4 py-2 text-primaryText hover:bg-gray-700">
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
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            New Folder
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center text-sm text-secondaryText">
        <button
          onClick={navigateUp}
          className="mr-2 rounded-md p-1 hover:bg-quaternaryBackground"
          disabled={currentPath === '/'}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {generateBreadcrumbs().map((breadcrumb, index) => (
          <div key={index} className="flex items-center">
            <button
              onClick={() => navigateToFolder(breadcrumb.path)}
              className={`px-2 hover:text-accentBlue ${
                index === generateBreadcrumbs().length - 1
                  ? 'font-medium text-accentBlue'
                  : ''
              }`}
            >
              {breadcrumb.name}
            </button>
            {index < generateBreadcrumbs().length - 1 && (
              <span className="mx-1">/</span>
            )}
          </div>
        ))}
      </div>

      {/* Document listing */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accentBlue"></div>
        </div>
      ) : (
        <>
          {filteredFolders.length === 0 && filteredDocuments.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-secondaryText">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mb-2 text-lg font-medium">No documents found</p>
              <p className="text-sm">
                {searchQuery ? "Try a different search term" : "Create a new document to get started"}
              </p>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-2'}>
              {/* Folders first */}
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => navigateToFolder(folder.path)}
                  className={`cursor-pointer rounded-lg border border-borderPrimary ${
                    view === 'grid' 
                      ? 'flex flex-col items-center p-4 transition-all hover:border-accentBlue hover:shadow-lg' 
                      : 'flex items-center p-3 transition-all hover:bg-quaternaryBackground'
                  }`}
                >
                  <div className={`${view === 'grid' ? 'mb-3 text-4xl' : 'mr-4 text-2xl'}`}>
                    📁
                  </div>
                  <div className={view === 'grid' ? 'text-center' : 'flex flex-1 items-center justify-between'}>
                    <div>
                      <p className="font-medium text-primaryText">{folder.name}</p>
                      {view === 'list' && (
                        <p className="text-sm text-secondaryText">Folder</p>
                      )}
                    </div>
                    {view === 'list' && (
                      <div className="flex items-center space-x-4">
                        <button className="text-secondaryText hover:text-accentBlue">
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Documents */}
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className={`rounded-lg border border-borderPrimary ${
                    view === 'grid' 
                      ? 'flex flex-col items-center p-4 transition-all hover:border-accentBlue hover:shadow-lg' 
                      : 'flex items-center p-3 transition-all hover:bg-quaternaryBackground'
                  }`}
                >
                  <div className={`${view === 'grid' ? 'mb-3 text-4xl' : 'mr-4 text-2xl'}`}>
                    {getFileIcon(document.type, document.name)}
                  </div>
                  <div className={view === 'grid' ? 'text-center' : 'flex flex-1 items-center justify-between'}>
                    <div>
                      <p className="font-medium text-primaryText">{document.name}</p>
                      {view === 'list' && (
                        <p className="text-sm text-secondaryText">
                          {new Date(document.lastModified).toLocaleDateString()} · {(document.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    {view === 'list' && (
                      <div className="flex items-center space-x-4">
                        <button className="text-secondaryText hover:text-accentBlue">
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
                        </button>
                        <button className="text-secondaryText hover:text-accentBlue">
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {view === 'grid' && (
                    <div className="mt-2 text-xs text-secondaryText">
                      {new Date(document.lastModified).toLocaleDateString()} · {(document.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
