import * as vscode from 'vscode';

export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3
}

// @ai-link name=Logger
// @ai-related LogLevel,vscode.OutputChannel
// @ai-exec logging,diagnostics
class Logger {
  private _outputChannel: vscode.OutputChannel;
  private _logLevel: LogLevel;

  // @ai-link name=LoggerConstructor
  // @ai-depends on=vscode.window.createOutputChannel
  // @ai-related Logger,LogLevel
  constructor() {
    this._outputChannel = vscode.window.createOutputChannel('FuncMap');
    this._logLevel = LogLevel.info;
  }

  // @ai-link name=logDebug
  // @ai-depends on=_log
  // @ai-related LogLevel
  // @ai-exec logging,debug
  debug(message: string, ...args: any[]): void {
    this._log(LogLevel.debug, message, ...args);
  }

  // @ai-link name=logInfo
  // @ai-depends on=_log
  // @ai-related LogLevel
  // @ai-exec logging,info
  info(message: string, ...args: any[]): void {
    this._log(LogLevel.info, message, ...args);
  }

  // @ai-link name=logWarn
  // @ai-depends on=_log
  // @ai-related LogLevel
  // @ai-exec logging,warning
  warn(message: string, ...args: any[]): void {
    this._log(LogLevel.warn, message, ...args);
  }

  // @ai-link name=logError
  // @ai-depends on=_log
  // @ai-related LogLevel
  // @ai-exec logging,error
  error(message: string, ...args: any[]): void {
    this._log(LogLevel.error, message, ...args);
  }

  // @ai-link name=setLogLevel
  // @ai-related LogLevel
  // @ai-exec logging,configuration
  setLogLevel(level: LogLevel): void {
    this._logLevel = level;
  }

  // @ai-link name=_log
  // @ai-depends on=LogLevel,_outputChannel.appendLine,_outputChannel.show
  // @ai-related Logger
  // @ai-exec logging,internal
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