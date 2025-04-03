/**
 * Content Filtering and Safety Module for Multi-RoleAI
 * 
 * This module implements content filtering, moderation, and safety measures
 * to ensure that AI interactions remain safe, appropriate, and compliant
 * with ethical guidelines.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { prisma } from '../../lib/prisma';

// Content categories that might require filtering or special handling
export enum ContentCategory {
  SAFE = 'safe',
  PROFANITY = 'profanity',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  SEXUAL = 'sexual',
  HARMFUL_INSTRUCTIONS = 'harmful_instructions',
  PII = 'personally_identifiable_information',
  MALICIOUS_CODE = 'malicious_code',
  POTENTIAL_COPYRIGHT = 'potential_copyright',
}

export interface ContentSafetyResult {
  id: string;
  isAllowed: boolean;
  categories: Array<{
    category: ContentCategory;
    confidence: number;
  }>;
  redactedContent?: string;
  reason?: string;
  timestamp: Date;
}

export interface FilterConfig {
  thresholds: Partial<Record<ContentCategory, number>>;
  enabledFilters: ContentCategory[];
  redactionEnabled: boolean;
  reportModerationResults: boolean;
  blockHighRiskContent: boolean;
  customAllowList?: string[];
  customBlockList?: string[];
}

// Default configuration for the content filter
const DEFAULT_FILTER_CONFIG: FilterConfig = {
  thresholds: {
    [ContentCategory.PROFANITY]: 0.7,
    [ContentCategory.HATE_SPEECH]: 0.5,
    [ContentCategory.VIOLENCE]: 0.6,
    [ContentCategory.SEXUAL]: 0.6,
    [ContentCategory.HARMFUL_INSTRUCTIONS]: 0.5,
    [ContentCategory.PII]: 0.5,
    [ContentCategory.MALICIOUS_CODE]: 0.5,
  },
  enabledFilters: [
    ContentCategory.HATE_SPEECH,
    ContentCategory.HARMFUL_INSTRUCTIONS,
    ContentCategory.MALICIOUS_CODE,
    ContentCategory.PII,
  ],
  redactionEnabled: true,
  reportModerationResults: true,
  blockHighRiskContent: true,
};

/**
 * Basic word/phrase pattern matching for sensitive content
 * In a production system, this would be replaced with a more sophisticated
 * ML-based content filtering system or integration with content moderation APIs
 */
const PATTERN_RULES: Record<ContentCategory, RegExp[]> = {
  [ContentCategory.PROFANITY]: [
    /\b(f[*u]ck|sh[*i]t|b[*i]tch|d[*a]mn|ass[*h]ole)\b/i,
  ],
  [ContentCategory.HATE_SPEECH]: [
    /\b(racial slurs|hate speech|derogatory terms)\b/i,
  ],
  [ContentCategory.VIOLENCE]: [
    /\b(kill|murder|bomb|attack|assault|weapon)\b/i,
  ],
  [ContentCategory.SEXUAL]: [
    /\b(explicit sexual content|pornography|sexual assault)\b/i,
  ],
  [ContentCategory.HARMFUL_INSTRUCTIONS]: [
    /\b(how to (make|create|build) (bomb|explosive|weapon|virus|malware))\b/i,
    /\b(hack|exploit|bypass security|circumvent protection)\b/i,
  ],
  [ContentCategory.PII]: [
    /\b(\d{3}-\d{2}-\d{4})\b/, // SSN pattern
    /\b\d{16}\b/, // Credit card number pattern
    /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/, // Email pattern
  ],
  [ContentCategory.MALICIOUS_CODE]: [
    /\b(eval\(|system\(|exec\(|rm -rf|DROP TABLE|DELETE FROM)\b/i,
  ],
  [ContentCategory.POTENTIAL_COPYRIGHT]: [
    /\b(copyright|proprietary|confidential|all rights reserved)\b/i,
  ],
  [ContentCategory.SAFE]: [], // No patterns for safe content
};

/**
 * ContentFilter class provides methods for checking and filtering potentially
 * harmful or inappropriate content
 */
export class ContentFilter {
  private config: FilterConfig;
  
  constructor(config: Partial<FilterConfig> = {}) {
    this.config = { ...DEFAULT_FILTER_CONFIG, ...config };
  }
  
  /**
   * Analyzes content for potentially harmful or inappropriate material
   * @param content Text content to analyze
   * @param userId Optional user ID for tracking and personalization
   * @returns Content safety analysis result
   */
  async analyzeContent(content: string, userId?: string): Promise<ContentSafetyResult> {
    const result: ContentSafetyResult = {
      id: uuidv4(),
      isAllowed: true,
      categories: [],
      timestamp: new Date(),
    };
    
    try {
      // Check against custom block list first (exact matches)
      if (this.config.customBlockList?.some(phrase => content.includes(phrase))) {
        result.isAllowed = false;
        result.reason = 'Content contains blocked phrases';
        result.categories.push({
          category: ContentCategory.HARMFUL_INSTRUCTIONS,
          confidence: 1.0,
        });
      }
      
      // Check against allow list (whitelist overrides other checks)
      if (this.config.customAllowList?.some(phrase => content.includes(phrase))) {
        result.isAllowed = true;
        result.categories.push({
          category: ContentCategory.SAFE,
          confidence: 1.0,
        });
        return result;
      }
      
      // Analyze content using pattern matching
      for (const category of this.config.enabledFilters) {
        const patterns = PATTERN_RULES[category];
        
        for (const pattern of patterns) {
          if (pattern.test(content)) {
            const threshold = this.config.thresholds[category] || 0.5;
            const confidence = this.calculateConfidence(content, pattern);
            
            result.categories.push({
              category,
              confidence,
            });
            
            // Check if content should be blocked based on threshold
            if (confidence >= threshold && this.config.blockHighRiskContent) {
              result.isAllowed = false;
              result.reason = `Content potentially contains ${category} (confidence: ${confidence.toFixed(2)})`;
            }
          }
        }
      }
      
      // Create redacted version if needed
      if (!result.isAllowed && this.config.redactionEnabled) {
        result.redactedContent = this.redactContent(content, result.categories);
      }
      
      // Record moderation result if enabled
      if (this.config.reportModerationResults) {
        await this.recordModerationResult(result, content, userId);
      }
      
      return result;
    } catch (error) {
      logger.error('Error analyzing content safety:', error);
      // Fail closed - if there's an error in the safety check, don't allow the content
      return {
        id: uuidv4(),
        isAllowed: false,
        categories: [],
        reason: 'Error analyzing content safety',
        timestamp: new Date(),
      };
    }
  }
  
  /**
   * Records content moderation result for auditing and improvement
   */
  private async recordModerationResult(
    result: ContentSafetyResult,
    originalContent: string,
    userId?: string
  ): Promise<void> {
    try {
      await prisma.moderationLog.create({
        data: {
          id: result.id,
          isAllowed: result.isAllowed,
          categories: JSON.stringify(result.categories),
          reason: result.reason,
          userId: userId,
          contentHash: this.hashContent(originalContent),
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      logger.error('Error recording moderation result:', error);
    }
  }
  
  /**
   * Creates a hash of content for privacy-preserving logging
   */
  private hashContent(content: string): string {
    // In a real implementation, use a proper cryptographic hash
    // This is a simplified placeholder
    return Buffer.from(content).toString('base64').substring(0, 20);
  }
  
  /**
   * Calculates confidence score for a pattern match
   */
  private calculateConfidence(content: string, pattern: RegExp): number {
    // This is a simplified confidence calculation
    // In a real implementation, use ML models or more sophisticated heuristics
    const matches = content.match(pattern);
    
    if (!matches) return 0;
    
    // More matches increase confidence
    const matchRatio = matches.length / content.split(' ').length;
    return Math.min(0.5 + matchRatio, 1.0);
  }
  
  /**
   * Creates a redacted version of content by replacing sensitive parts
   */
  private redactContent(
    content: string,
    categoryResults: Array<{ category: ContentCategory; confidence: number }>
  ): string {
    let redactedContent = content;
    
    // For each identified category, redact content using the patterns
    for (const { category, confidence } of categoryResults) {
      if (confidence >= (this.config.thresholds[category] || 0.5)) {
        const patterns = PATTERN_RULES[category];
        
        for (const pattern of patterns) {
          redactedContent = redactedContent.replace(pattern, '[REDACTED]');
        }
      }
    }
    
    return redactedContent;
  }
  
  /**
   * Detects and redacts personally identifiable information (PII)
   */
  detectAndRedactPII(content: string): string {
    const piiPatterns = PATTERN_RULES[ContentCategory.PII];
    let redactedContent = content;
    
    for (const pattern of piiPatterns) {
      redactedContent = redactedContent.replace(pattern, '[PII REDACTED]');
    }
    
    return redactedContent;
  }
  
  /**
   * Scans code for potentially malicious patterns
   */
  scanCodeForMaliciousPatterns(code: string, language: string): ContentSafetyResult {
    const result: ContentSafetyResult = {
      id: uuidv4(),
      isAllowed: true,
      categories: [],
      timestamp: new Date(),
    };
    
    // Additional language-specific patterns
    const languagePatterns: Record<string, RegExp[]> = {
      javascript: [
        /eval\s*\(/g,
        /Function\s*\(\s*["'`]return/g,
        /process\.env/g,
        /require\s*\(\s*["'`]child_process["'`]\s*\)/g,
      ],
      python: [
        /exec\s*\(/g,
        /eval\s*\(/g,
        /os\.system\s*\(/g,
        /subprocess\.call\s*\(/g,
        /import\s+os/g,
      ],
      sql: [
        /DROP\s+TABLE/gi,
        /DROP\s+DATABASE/gi,
        /DELETE\s+FROM/gi,
        /UPDATE\s+.+\s+SET/gi,
      ],
    };
    
    // Check general malicious code patterns
    const generalPatterns = PATTERN_RULES[ContentCategory.MALICIOUS_CODE];
    for (const pattern of generalPatterns) {
      if (pattern.test(code)) {
        result.categories.push({
          category: ContentCategory.MALICIOUS_CODE,
          confidence: 0.7,
        });
      }
    }
    
    // Check language-specific patterns
    const specificPatterns = languagePatterns[language as keyof typeof languagePatterns] || [];
    for (const pattern of specificPatterns) {
      if (pattern.test(code)) {
        result.categories.push({
          category: ContentCategory.MALICIOUS_CODE,
          confidence: 0.8,
        });
      }
    }
    
    // Determine if code should be blocked
    if (result.categories.length > 0 && this.config.blockHighRiskContent) {
      result.isAllowed = false;
      result.reason = 'Code contains potentially malicious patterns';
    }
    
    return result;
  }
  
  /**
   * Updates the filter configuration
   */
  updateConfig(newConfig: Partial<FilterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default new ContentFilter();
