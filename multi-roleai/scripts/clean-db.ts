/**
 * Database cleanup script for production deployment
 * Removes all sample/placeholder workspaces, tasks, documents, and agent sessions
 */

import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('Starting database cleanup for production...');
  
  const prisma = new PrismaClient();
  
  try {
    // Delete all documents
    const deletedDocuments = await prisma.document.deleteMany({});
    console.log(`Deleted ${deletedDocuments.count} documents`);
    
    // Delete all agent sessions
    const deletedAgentSessions = await prisma.agentSession.deleteMany({});
    console.log(`Deleted ${deletedAgentSessions.count} agent sessions`);
    
    // Delete all tasks
    const deletedTasks = await prisma.task.deleteMany({});
    console.log(`Deleted ${deletedTasks.count} tasks`);
    
    // Delete all workspaces
    const deletedWorkspaces = await prisma.workspace.deleteMany({});
    console.log(`Deleted ${deletedWorkspaces.count} workspaces`);
    
    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
