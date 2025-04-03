'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'api' | 'agent' | 'appearance'>('general');
  
  // State for form inputs
  const [generalSettings, setGeneralSettings] = useState({
    defaultWorkspace: '',
    autoSaveDuration: 5,
    showWelcomeScreen: true
  });
  
  const [apiSettings, setApiSettings] = useState({
    anthropicApiKey: '',
    useCustomApiEndpoint: false,
    customApiEndpoint: ''
  });
  
  const [agentSettings, setAgentSettings] = useState({
    maxConcurrentTasks: 3,
    taskTimeout: 30,
    enableAgentLogging: true,
    verboseMode: false
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system',
    fontSize: 'medium',
    compactMode: false
  });
  
  // Form submission handlers
  const handleGeneralSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving general settings:', generalSettings);
    // In a real implementation, this would call an API
  };
  
  const handleApiSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving API settings:', apiSettings);
    // In a real implementation, this would call an API
  };
  
  const handleAgentSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving agent settings:', agentSettings);
    // In a real implementation, this would call an API
  };
  
  const handleAppearanceSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving appearance settings:', appearanceSettings);
    // In a real implementation, this would call an API
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-secondaryBackground p-6 shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-primaryText">Settings</h1>
      
      {/* Settings navigation tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-borderPrimary">
        <button
          onClick={() => setActiveTab('general')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'general'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'account'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'api'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab('agent')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'agent'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Agent Behavior
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
            activeTab === 'appearance'
              ? 'border-b-2 border-accentBlue text-accentBlue'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Appearance
        </button>
      </div>
      
      {/* Settings content area */}
      <div className="flex-1 overflow-y-auto">
        {/* General Settings */}
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSettingsSubmit} className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-primaryText">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Default Workspace
                  </label>
                  <input
                    type="text"
                    value={generalSettings.defaultWorkspace}
                    onChange={(e) => setGeneralSettings({...generalSettings, defaultWorkspace: e.target.value})}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Auto-save Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={generalSettings.autoSaveDuration}
                    onChange={(e) => setGeneralSettings({...generalSettings, autoSaveDuration: parseInt(e.target.value)})}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="welcome-screen"
                    type="checkbox"
                    checked={generalSettings.showWelcomeScreen}
                    onChange={(e) => setGeneralSettings({...generalSettings, showWelcomeScreen: e.target.checked})}
                    className="h-4 w-4 rounded border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                  />
                  <label htmlFor="welcome-screen" className="ml-2 text-sm text-primaryText">
                    Show welcome screen on startup
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-accentBlue px-4 py-2 font-medium text-white hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
        
        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-primaryText">Account Settings</h2>
              
              <div className="mb-6 rounded-lg border border-borderPrimary bg-tertiaryBackground p-4">
                <div className="mb-4 flex items-center">
                  <div className="h-16 w-16 rounded-full bg-accentBlue">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-full w-full rounded-full"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-accentBlue text-xl font-medium text-white">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-primaryText">{session?.user?.name}</h3>
                    <p className="text-secondaryText">{session?.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md bg-quaternaryBackground px-4 py-2 text-primaryText hover:bg-gray-700">
                    Change Profile Picture
                  </button>
                  <button className="rounded-md bg-quaternaryBackground px-4 py-2 text-primaryText hover:bg-gray-700">
                    Change Password
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={session?.user?.name || ''}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={session?.user?.email || ''}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-md bg-accentBlue px-4 py-2 font-medium text-white hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="border-t border-borderPrimary pt-6">
              <h3 className="mb-4 text-lg font-semibold text-primaryText">Danger Zone</h3>
              
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
        
        {/* API Settings */}
        {activeTab === 'api' && (
          <form onSubmit={handleApiSettingsSubmit} className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-primaryText">API Keys</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Anthropic Claude API Key
                  </label>
                  <div className="flex">
                    <input
                      type="password"
                      value={apiSettings.anthropicApiKey}
                      onChange={(e) => setApiSettings({...apiSettings, anthropicApiKey: e.target.value})}
                      className="w-full rounded-l-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                    />
                    <button
                      type="button"
                      className="rounded-r-md border border-l-0 border-borderPrimary bg-quaternaryBackground px-4 py-2 text-primaryText hover:bg-gray-700"
                    >
                      Show
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-secondaryText">
                    Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-accentBlue hover:underline">Anthropic Console</a>
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="custom-endpoint"
                    type="checkbox"
                    checked={apiSettings.useCustomApiEndpoint}
                    onChange={(e) => setApiSettings({...apiSettings, useCustomApiEndpoint: e.target.checked})}
                    className="h-4 w-4 rounded border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                  />
                  <label htmlFor="custom-endpoint" className="ml-2 text-sm text-primaryText">
                    Use custom API endpoint
                  </label>
                </div>
                
                {apiSettings.useCustomApiEndpoint && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-secondaryText">
                      Custom API Endpoint
                    </label>
                    <input
                      type="text"
                      value={apiSettings.customApiEndpoint}
                      onChange={(e) => setApiSettings({...apiSettings, customApiEndpoint: e.target.value})}
                      placeholder="https://api.example.com/v1"
                      className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-accentBlue px-4 py-2 font-medium text-white hover:bg-blue-600"
                >
                  Save API Settings
                </button>
              </div>
            </div>
          </form>
        )}
        
        {/* Agent Behavior Settings */}
        {activeTab === 'agent' && (
          <form onSubmit={handleAgentSettingsSubmit} className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-primaryText">Agent Behavior</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Maximum Concurrent Tasks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={agentSettings.maxConcurrentTasks}
                    onChange={(e) => setAgentSettings({...agentSettings, maxConcurrentTasks: parseInt(e.target.value)})}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-secondaryText">
                    Number of tasks that can run simultaneously
                  </p>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Task Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={agentSettings.taskTimeout}
                    onChange={(e) => setAgentSettings({...agentSettings, taskTimeout: parseInt(e.target.value)})}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-secondaryText">
                    Maximum time before a task is considered stalled
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="agent-logging"
                    type="checkbox"
                    checked={agentSettings.enableAgentLogging}
                    onChange={(e) => setAgentSettings({...agentSettings, enableAgentLogging: e.target.checked})}
                    className="h-4 w-4 rounded border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                  />
                  <label htmlFor="agent-logging" className="ml-2 text-sm text-primaryText">
                    Enable agent activity logging
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="verbose-mode"
                    type="checkbox"
                    checked={agentSettings.verboseMode}
                    onChange={(e) => setAgentSettings({...agentSettings, verboseMode: e.target.checked})}
                    className="h-4 w-4 rounded border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                  />
                  <label htmlFor="verbose-mode" className="ml-2 text-sm text-primaryText">
                    Verbose mode (show detailed agent thought process)
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-accentBlue px-4 py-2 font-medium text-white hover:bg-blue-600"
                >
                  Save Agent Settings
                </button>
              </div>
            </div>
          </form>
        )}
        
        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <form onSubmit={handleAppearanceSettingsSubmit} className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-primaryText">Appearance</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={appearanceSettings.theme === 'light'}
                        onChange={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})}
                        className="h-4 w-4 border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                      />
                      <span className="ml-2 text-sm text-primaryText">Light</span>
                    </label>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={appearanceSettings.theme === 'dark'}
                        onChange={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})}
                        className="h-4 w-4 border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                      />
                      <span className="ml-2 text-sm text-primaryText">Dark</span>
                    </label>
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={appearanceSettings.theme === 'system'}
                        onChange={() => setAppearanceSettings({...appearanceSettings, theme: 'system'})}
                        className="h-4 w-4 border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                      />
                      <span className="ml-2 text-sm text-primaryText">System</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-secondaryText">
                    Font Size
                  </label>
                  <select
                    value={appearanceSettings.fontSize}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, fontSize: e.target.value as 'small' | 'medium' | 'large'})}
                    className="w-full rounded-md border border-borderPrimary bg-tertiaryBackground px-4 py-2 text-primaryText focus:border-accentBlue focus:outline-none"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="compact-mode"
                    type="checkbox"
                    checked={appearanceSettings.compactMode}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, compactMode: e.target.checked})}
                    className="h-4 w-4 rounded border-borderPrimary bg-tertiaryBackground text-accentBlue focus:ring-accentBlue"
                  />
                  <label htmlFor="compact-mode" className="ml-2 text-sm text-primaryText">
                    Compact mode (reduced spacing)
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-accentBlue px-4 py-2 font-medium text-white hover:bg-blue-600"
                >
                  Save Appearance Settings
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
