import * as vscode from 'vscode';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('AI Contextual Linking');
    this.logLevel = LogLevel.INFO; // Default log level
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(message: string): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.log('DEBUG', message);
    }
  }

  info(message: string): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.log('INFO', message);
    }
  }

  warn(message: string): void {
    if (this.logLevel <= LogLevel.WARN) {
      this.log('WARN', message);
    }
  }

  error(message: string, error?: Error): void {
    if (this.logLevel <= LogLevel.ERROR) {
      this.log('ERROR', message);
      if (error) {
        this.log('ERROR', error.stack || error.toString());
      }
    }
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  show(): void {
    this.outputChannel.show();
  }
}

// Export a singleton instance
export const logger = new Logger(); 