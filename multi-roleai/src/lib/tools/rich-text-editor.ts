/**
 * Rich Text Editor Tool for Multi-RoleAI
 * Provides functionality for working with rich text content using TipTap
 */

import { Tool, ToolType, ToolCapability } from './types';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface RichTextEditorTool extends Tool {
  createDocument: (title: string, content?: string, format?: string) => Promise<string>;
  updateDocument: (documentId: string, content: string) => Promise<boolean>;
  convertDocument: (documentId: string, targetFormat: string) => Promise<string>;
  createTemplate: (title: string, content: string, templateType: string) => Promise<string>;
}

interface DocumentMetadata {
  id: string;
  title: string;
  format: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Creates and returns an instance of the RichTextEditorTool
 */
export function getRichTextEditorTool(): RichTextEditorTool {
  const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
  const documentsPath = path.join(storagePath, 'documents');
  const templatesPath = path.join(storagePath, 'templates');
  
  // Ensure storage directories exist
  (async () => {
    try {
      await fs.mkdir(documentsPath, { recursive: true });
      await fs.mkdir(templatesPath, { recursive: true });
    } catch (error) {
      console.error('Error creating document storage directories:', error instanceof Error ? error.message : String(error));
    }
  })();

  return {
    id: 'rich-text-editor',
    name: 'Rich Text Editor Tool',
    description: 'Tool for creating and editing rich text documents with TipTap',
    type: ToolType.MULTI_MODAL,
    capabilities: [
      ToolCapability.DOCUMENT_ANALYSIS,
      ToolCapability.TEXT_PROCESSING
    ],
    
    /**
     * Creates a new document with optional initial content
     */
    async createDocument(title: string, content: string = '', format: string = 'html') {
      try {
        const documentId = uuidv4();
        const documentPath = path.join(documentsPath, `${documentId}.json`);
        
        // Create metadata object
        const metadata: DocumentMetadata = {
          id: documentId,
          title,
          format,
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Create document object with metadata and content
        const document = {
          metadata,
          content
        };
        
        // Save document
        await fs.writeFile(documentPath, JSON.stringify(document, null, 2));
        
        return documentId;
      } catch (error) {
        console.error('Error creating document:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to create document: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Updates an existing document with new content
     */
    async updateDocument(documentId: string, content: string) {
      try {
        const documentPath = path.join(documentsPath, `${documentId}.json`);
        
        // Check if document exists
        try {
          await fs.access(documentPath);
        } catch {
          throw new Error(`Document with ID ${documentId} not found`);
        }
        
        // Read existing document
        const documentContent = await fs.readFile(documentPath, 'utf-8');
        const document = JSON.parse(documentContent);
        
        // Update document content and metadata
        document.content = content;
        document.metadata.version += 1;
        document.metadata.updatedAt = new Date().toISOString();
        
        // Save updated document
        await fs.writeFile(documentPath, JSON.stringify(document, null, 2));
        
        return true;
      } catch (error) {
        console.error('Error updating document:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to update document: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Converts a document to a different format
     */
    async convertDocument(documentId: string, targetFormat: string) {
      try {
        const documentPath = path.join(documentsPath, `${documentId}.json`);
        
        // Check if document exists
        try {
          await fs.access(documentPath);
        } catch {
          throw new Error(`Document with ID ${documentId} not found`);
        }
        
        // Read existing document
        const documentContent = await fs.readFile(documentPath, 'utf-8');
        const document = JSON.parse(documentContent);
        
        // If already in target format, return the same ID
        if (document.metadata.format === targetFormat) {
          return documentId;
        }
        
        // In a real implementation, we would use a proper conversion library here
        // This is a simplified version that just copies the content to a new document
        
        // Create a new document with the converted content
        const newDocumentId = await this.createDocument(
          `${document.metadata.title} (${targetFormat})`,
          document.content,
          targetFormat
        );
        
        return newDocumentId;
      } catch (error) {
        console.error('Error converting document:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to convert document: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Creates a document template for reuse
     */
    async createTemplate(title: string, content: string, templateType: string) {
      try {
        const templateId = uuidv4();
        const templatePath = path.join(templatesPath, `${templateId}.json`);
        
        // Create template object
        const template = {
          id: templateId,
          title,
          type: templateType,
          content,
          createdAt: new Date().toISOString()
        };
        
        // Save template
        await fs.writeFile(templatePath, JSON.stringify(template, null, 2));
        
        return templateId;
      } catch (error) {
        console.error('Error creating template:', error instanceof Error ? error.message : String(error));
        throw new Error(`Failed to create template: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
}
