/**
 * Image Processing and Generation Tool for Multi-RoleAI
 * Handles image analysis, generation, and manipulation
 */

import { Tool, ToolType, ToolCapability } from './types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

export interface ImageProcessingTool extends Tool {
  analyzeImage: (imagePath: string) => Promise<any>;
  generateImage: (prompt: string, options?: ImageGenerationOptions) => Promise<string>;
  editImage: (imagePath: string, edits: ImageEditOptions) => Promise<string>;
  convertImage: (imagePath: string, format: ImageFormat, options?: any) => Promise<string>;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  model?: string;
  numberOfImages?: number;
  style?: string;
}

export interface ImageEditOptions {
  resize?: { width?: number; height?: number };
  crop?: { left: number; top: number; width: number; height: number };
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  brightness?: number;
  contrast?: number;
  grayscale?: boolean;
  blur?: number;
}

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'svg';

/**
 * Creates and returns an instance of the ImageProcessingTool
 */
export function getImageProcessingTool(): ImageProcessingTool {
  const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
  const imagesPath = path.join(storagePath, 'images');
  
  // Ensure the storage directory exists
  (async () => {
    try {
      await fs.mkdir(imagesPath, { recursive: true });
    } catch (error) {
      console.error('Error creating image storage directory:', error);
    }
  })();

  return {
    id: 'image-processing',
    name: 'Image Processing Tool',
    description: 'Tool for analyzing, generating, and editing images',
    type: ToolType.MULTI_MODAL,
    capabilities: [
      ToolCapability.IMAGE_ANALYSIS,
      ToolCapability.IMAGE_GENERATION,
      ToolCapability.IMAGE_EDITING
    ],
    
    /**
     * Analyzes an image and returns extracted information
     */
    async analyzeImage(imagePath: string) {
      try {
        // Use sharp to extract basic image metadata
        const metadata = await sharp(imagePath).metadata();
        
        // This would integrate with a vision model API in production
        return {
          metadata,
          analysis: {
            // This would be populated with actual analysis from a vision model
            description: "",
            objects: [],
            text: [],
            colors: []
          }
        };
      } catch (error) {
        console.error('Error analyzing image:', error);
        throw new Error(`Failed to analyze image: ${(error as Error).message}`);
      }
    },
    
    /**
     * Generates an image based on a text prompt
     */
    async generateImage(prompt: string, options: ImageGenerationOptions = {}) {
      try {
        // Default options
        const width = options.width || 512;
        const height = options.height || 512;
        
        // This would call an image generation API in production
        
        // Create a simple image with text indicating configuration is needed
        const filename = `${uuidv4()}.png`;
        const outputPath = path.join(imagesPath, filename);
        
        await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 240, g: 240, b: 240, alpha: 1 }
          }
        })
        .composite([{
          input: {
            text: {
              text: `Image generation requires configuration`,
              width: width - 40,
              height: 100,
              rgba: true
            }
          }
        }])
        .toFile(outputPath);
        
        return outputPath;
      } catch (error) {
        console.error('Error generating image:', error);
        throw new Error(`Failed to generate image: ${(error as Error).message}`);
      }
    },
    
    /**
     * Edits an existing image with specified transformations
     */
    async editImage(imagePath: string, edits: ImageEditOptions) {
      try {
        // Create a new image processing pipeline with sharp
        let imageProcessor = sharp(imagePath);
        
        // Apply edits based on the options provided
        if (edits.resize) {
          imageProcessor = imageProcessor.resize(edits.resize.width, edits.resize.height);
        }
        
        if (edits.crop) {
          imageProcessor = imageProcessor.extract(edits.crop);
        }
        
        if (edits.rotate) {
          imageProcessor = imageProcessor.rotate(edits.rotate);
        }
        
        if (edits.flip) {
          imageProcessor = imageProcessor.flip();
        }
        
        if (edits.flop) {
          imageProcessor = imageProcessor.flop();
        }
        
        if (edits.brightness !== undefined) {
          imageProcessor = imageProcessor.modulate({
            brightness: edits.brightness
          });
        }
        
        if (edits.contrast !== undefined) {
          imageProcessor = imageProcessor.modulate({
            brightness: edits.contrast
          });
        }
        
        if (edits.grayscale) {
          imageProcessor = imageProcessor.grayscale();
        }
        
        if (edits.blur) {
          imageProcessor = imageProcessor.blur(edits.blur);
        }
        
        // Save the edited image
        const filename = `edited-${path.basename(imagePath)}`;
        const outputPath = path.join(imagesPath, filename);
        await imageProcessor.toFile(outputPath);
        
        return outputPath;
      } catch (error) {
        console.error('Error editing image:', error);
        throw new Error(`Failed to edit image: ${error.message}`);
      }
    },
    
    /**
     * Converts an image to another format
     */
    async convertImage(imagePath: string, format: ImageFormat, options: any = {}) {
      try {
        // Create a new image processing pipeline with sharp
        const imageProcessor = sharp(imagePath);
        
        // Convert to the specified format
        switch (format) {
          case 'jpeg':
            imageProcessor.jpeg(options);
            break;
          case 'png':
            imageProcessor.png(options);
            break;
          case 'webp':
            imageProcessor.webp(options);
            break;
          case 'avif':
            imageProcessor.avif(options);
            break;
          case 'gif':
            imageProcessor.gif(options);
            break;
          case 'svg':
            // SVG conversion would require additional libraries
            throw new Error('SVG conversion not implemented');
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
        
        // Save the converted image
        const filename = `${path.parse(imagePath).name}.${format}`;
        const outputPath = path.join(imagesPath, filename);
        await imageProcessor.toFile(outputPath);
        
        return outputPath;
      } catch (error) {
        console.error('Error converting image:', error);
        throw new Error(`Failed to convert image: ${error.message}`);
      }
    }
  };
}
