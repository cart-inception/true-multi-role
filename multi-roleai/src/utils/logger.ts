/**
 * Logger Utility for Multi-RoleAI
 * 
 * Centralized logging system with different log levels and formatting
 */

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LoggerOptions {
  level: LogLevel;
  timestamps: boolean;
  colors: boolean;
  logToFile: boolean;
  logFilePath?: string;
}

const DEFAULT_OPTIONS: LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  timestamps: true,
  colors: process.env.NODE_ENV !== 'production',
  logToFile: process.env.NODE_ENV === 'production',
  logFilePath: process.env.LOG_FILE_PATH || './logs/app.log',
};

/**
 * Logger class for consistent logging across the application
 */
class Logger {
  private options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Log an error message
   */
  error(message: string, ...meta: any[]): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...meta: any[]): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log an informational message
   */
  info(message: string, ...meta: any[]): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...meta: any[]): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, meta: any[] = []): void {
    if (level > this.options.level) {
      return;
    }

    const timestamp = this.options.timestamps ? new Date().toISOString() : '';
    const levelName = LogLevel[level];
    
    // Format log message
    let formattedMessage = `${timestamp ? `[${timestamp}] ` : ''}[${levelName}] ${message}`;
    
    // Add colors in non-production environments
    if (this.options.colors) {
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[90m', // Gray
        reset: '\x1b[0m',
      };
      
      formattedMessage = `${colors[level]}${formattedMessage}${colors.reset}`;
    }
    
    // Log to console based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...meta);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...meta);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...meta);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...meta);
        break;
    }

    // Log to file if enabled
    if (this.options.logToFile) {
      // In a real implementation, this would write to a file
      // For now we'll just implement console logging
    }
  }

  /**
   * Configure logger options
   */
  configure(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.options.level = level;
  }
}

// Create singleton instance
export const logger = new Logger();

// Export types
export type { LogLevel, LoggerOptions };

export default logger;
