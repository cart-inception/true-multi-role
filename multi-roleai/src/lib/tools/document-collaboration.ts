/**
 * Document Collaboration Tool for Multi-RoleAI
 * Provides versioning, sharing, and collaboration features for documents
 */

import { Tool, ToolType, ToolCapability } from './types';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface DocumentCollaborationTool extends Tool {
  createVersion: (documentId: string, content: string, message: string) => Promise<string>;
  listVersions: (documentId: string) => Promise<DocumentVersion[]>;
  getVersion: (documentId: string, versionId: string) => Promise<DocumentVersion>;
  revertToVersion: (documentId: string, versionId: string) => Promise<boolean>;
  shareDocument: (documentId: string, userId: string, permissions: SharePermissions) => Promise<string>;
  listSharedUsers: (documentId: string) => Promise<SharedUser[]>;
  updatePermissions: (shareId: string, permissions: SharePermissions) => Promise<boolean>;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  message: string;
  createdAt: string;
  createdBy: string;
}

export interface SharedUser {
  userId: string;
  documentId: string;
  shareId: string;
  permissions: SharePermissions;
  sharedAt: string;
}

export interface SharePermissions {
  read: boolean;
  write: boolean;
  comment: boolean;
  share: boolean;
}

/**
 * Creates and returns an instance of the DocumentCollaborationTool
 */
export function getDocumentCollaborationTool(): DocumentCollaborationTool {
  const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
  const documentsPath = path.join(storagePath, 'documents');
  const versionsPath = path.join(storagePath, 'versions');
  const sharesPath = path.join(storagePath, 'shares');
  
  // Ensure storage directories exist
  (async () => {
    try {
      await fs.mkdir(documentsPath, { recursive: true });
      await fs.mkdir(versionsPath, { recursive: true });
      await fs.mkdir(sharesPath, { recursive: true });
    } catch (error) {
      console.error('Error creating collaboration storage directories:', error instanceof Error ? error.message : String(error));
    }
  })();

  return {
    id: 'document-collaboration',
    name: 'Document Collaboration Tool',
    description: 'Tool for document versioning, sharing, and collaboration',
    type: ToolType.MULTI_MODAL,
    capabilities: [
      ToolCapability.DOCUMENT_ANALYSIS,
      ToolCapability.TEXT_PROCESSING
    ],
    
    /**
     * Creates a new version of a document
     */
    async createVersion(documentId: string, content: string, message: string) {
      try {
        const documentPath = path.join(documentsPath, `${documentId}.json`);
        
        // Check if document exists
        try {
          await fs.access(documentPath);
        } catch {
          throw new Error(`Document with ID ${documentId} not found`);
        }
        
        // Create version ID
        const versionId = uuidv4();
        const versionPath = path.join(versionsPath, `${versionId}.json`);
        
        // Create version object
        const version: DocumentVersion = {
          id: versionId,
          documentId,
          content,
          message,
          createdAt: new Date().toISOString(),
          createdBy: 'current-user' // In a real implementation, this would be the actual user ID
        };
        
        // Save version
        await fs.writeFile(versionPath, JSON.stringify(version, null, 2));
        
        // Update document with new content
        const documentContent = await fs.readFile(documentPath, 'utf-8');
        const document = JSON.parse(documentContent);
        document.content = content;
        document.metadata.version += 1;
        document.metadata.updatedAt = new Date().toISOString();
        
        // Save updated document
        await fs.writeFile(documentPath, JSON.stringify(document, null, 2));
        
        return versionId;
      } catch (error) {
        console.error('Error creating document version:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to create document version: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Lists all versions of a document
     */
    async listVersions(documentId: string) {
      try {
        // In a real implementation, we would query a database
        // For this simplified version, we'll list all files in the versions directory
        // and filter for those matching the document ID
        
        const versions: DocumentVersion[] = [];
        
        // List all version files
        const files = await fs.readdir(versionsPath);
        
        // Process each file
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          
          const versionPath = path.join(versionsPath, file);
          const versionContent = await fs.readFile(versionPath, 'utf-8');
          const version = JSON.parse(versionContent) as DocumentVersion;
          
          if (version.documentId === documentId) {
            versions.push(version);
          }
        }
        
        // Sort versions by creation date (newest first)
        versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return versions;
      } catch (error) {
        console.error('Error listing document versions:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to list document versions: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Gets a specific version of a document
     */
    async getVersion(documentId: string, versionId: string) {
      try {
        const versionPath = path.join(versionsPath, `${versionId}.json`);
        
        // Check if version exists
        try {
          await fs.access(versionPath);
        } catch {
          throw new Error(`Version with ID ${versionId} not found`);
        }
        
        // Read version
        const versionContent = await fs.readFile(versionPath, 'utf-8');
        const version = JSON.parse(versionContent) as DocumentVersion;
        
        // Verify version is for the correct document
        if (version.documentId !== documentId) {
          throw new Error(`Version ${versionId} is not for document ${documentId}`);
        }
        
        return version;
      } catch (error) {
        console.error('Error getting document version:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to get document version: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Reverts a document to a specific version
     */
    async revertToVersion(documentId: string, versionId: string) {
      try {
        // Get the version to revert to
        const version = await this.getVersion(documentId, versionId);
        
        // Update the document with the content from this version
        const documentPath = path.join(documentsPath, `${documentId}.json`);
        const documentContent = await fs.readFile(documentPath, 'utf-8');
        const document = JSON.parse(documentContent);
        
        // Update document
        document.content = version.content;
        document.metadata.version += 1;
        document.metadata.updatedAt = new Date().toISOString();
        document.metadata.revertedFrom = versionId;
        
        // Save updated document
        await fs.writeFile(documentPath, JSON.stringify(document, null, 2));
        
        // Create a new version to record this revert
        await this.createVersion(documentId, version.content, `Reverted to version ${versionId}`);
        
        return true;
      } catch (error) {
        console.error('Error reverting to document version:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to revert to document version: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Shares a document with another user
     */
    async shareDocument(documentId: string, userId: string, permissions: SharePermissions) {
      try {
        const documentPath = path.join(documentsPath, `${documentId}.json`);
        
        // Check if document exists
        try {
          await fs.access(documentPath);
        } catch {
          throw new Error(`Document with ID ${documentId} not found`);
        }
        
        // Create share ID
        const shareId = uuidv4();
        const sharePath = path.join(sharesPath, `${shareId}.json`);
        
        // Create share object
        const share: SharedUser = {
          userId,
          documentId,
          shareId,
          permissions,
          sharedAt: new Date().toISOString()
        };
        
        // Save share
        await fs.writeFile(sharePath, JSON.stringify(share, null, 2));
        
        return shareId;
      } catch (error) {
        console.error('Error sharing document:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to share document: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Lists all users a document is shared with
     */
    async listSharedUsers(documentId: string) {
      try {
        // In a real implementation, we would query a database
        // For this simplified version, we'll list all files in the shares directory
        // and filter for those matching the document ID
        
        const shares: SharedUser[] = [];
        
        // List all share files
        const files = await fs.readdir(sharesPath);
        
        // Process each file
        for (const file of files) {
          if (!file.endsWith('.json')) continue;
          
          const sharePath = path.join(sharesPath, file);
          const shareContent = await fs.readFile(sharePath, 'utf-8');
          const share = JSON.parse(shareContent) as SharedUser;
          
          if (share.documentId === documentId) {
            shares.push(share);
          }
        }
        
        return shares;
      } catch (error) {
        console.error('Error listing shared users:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to list shared users: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Updates permissions for a shared document
     */
    async updatePermissions(shareId: string, permissions: SharePermissions) {
      try {
        const sharePath = path.join(sharesPath, `${shareId}.json`);
        
        // Check if share exists
        try {
          await fs.access(sharePath);
        } catch {
          throw new Error(`Share with ID ${shareId} not found`);
        }
        
        // Read share
        const shareContent = await fs.readFile(sharePath, 'utf-8');
        const share = JSON.parse(shareContent) as SharedUser;
        
        // Update permissions
        share.permissions = permissions;
        
        // Save updated share
        await fs.writeFile(sharePath, JSON.stringify(share, null, 2));
        
        return true;
      } catch (error) {
        console.error('Error updating share permissions:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to update share permissions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
}
