import * as vscode from 'vscode';

export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3
}

class Logger {
  private _outputChannel: vscode.OutputChannel;
  private _logLevel: LogLevel;

  constructor() {
    this._outputChannel = vscode.window.createOutputChannel('FuncMap');
    this._logLevel = LogLevel.info;
  }

  debug(message: string, ...args: any[]): void {
    this._log(LogLevel.debug, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this._log(LogLevel.info, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this._log(LogLevel.warn, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this._log(LogLevel.error, message, ...args);
  }

  setLogLevel(level: LogLevel): void {
    this._logLevel = level;
  }

  private _log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this._logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level].toUpperCase();
    let logMessage = `[${timestamp}] [${levelStr}] ${message}`;

    if (args.length > 0) {
      args.forEach(arg => {
        if (arg instanceof Error) {
          logMessage += `\n${arg.stack || arg.message}`;
        } else {
          logMessage += `\n${JSON.stringify(arg, null, 2)}`;
        }
      });
    }

    this._outputChannel.appendLine(logMessage);

    if (level >= LogLevel.error) {
      this._outputChannel.show();
    }
  }
}

export const logger = new Logger(); 