import * as vscode from 'vscode';
import { updateIndex } from './commands/updateIndex';
import { logger } from './utils/logger';
import { closeDatabase } from './storage/sqliteStorage';
import { getConfiguration } from './utils/config';
import { getFunctionData } from './storage/jsonStorage';
import { getFunctionDataFromSqlite, findDependentFunctions, findRelatedFunctions, findFunctionsByExecToken } from './storage/sqliteStorage';

export function activate(context: vscode.ExtensionContext) {
  logger.info('AI Contextual Linking is now active');

  // Register the update index command
  const updateIndexCommand = vscode.commands.registerCommand(
    'aiContextualLinking.updateIndex',
    () => updateIndex(context)
  );

  context.subscriptions.push(updateIndexCommand);

  // Register query commands
  const getFunctionDataCommand = vscode.commands.registerCommand(
    'aiContextualLinking.getFunctionData',
    async (functionName: string) => {
      const config = getConfiguration();
      const storageType = config.get<string>('storageType', 'json');
      
      if (storageType === 'sqlite') {
        return await getFunctionDataFromSqlite(functionName);
      } else {
        return await getFunctionData(functionName);
      }
    }
  );

  const findDependentFunctionsCommand = vscode.commands.registerCommand(
    'aiContextualLinking.findDependentFunctions',
    async (functionName: string) => {
      return await findDependentFunctions(functionName);
    }
  );

  const findRelatedFunctionsCommand = vscode.commands.registerCommand(
    'aiContextualLinking.findRelatedFunctions',
    async (moduleName: string) => {
      return await findRelatedFunctions(moduleName);
    }
  );

  const findFunctionsByExecTokenCommand = vscode.commands.registerCommand(
    'aiContextualLinking.findFunctionsByExecToken',
    async (token: string) => {
      return await findFunctionsByExecToken(token);
    }
  );

  context.subscriptions.push(getFunctionDataCommand);
  context.subscriptions.push(findDependentFunctionsCommand);
  context.subscriptions.push(findRelatedFunctionsCommand);
  context.subscriptions.push(findFunctionsByExecTokenCommand);

  // Set up file watchers if enabled
  const config = getConfiguration();
  if (config.get<boolean>('watchFiles', true)) {
    const filePatterns = config.get<string[]>('filePatterns', ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']);
    logger.debug(`Setting up file watchers for patterns: ${filePatterns.join(', ')}`);
    
    const fileWatcher = vscode.workspace.createFileSystemWatcher(`{${filePatterns.join(',')}}`);
    
    // Debounced update to avoid excessive processing
    let updateTimeout: NodeJS.Timeout | null = null;
    const debouncedUpdate = (e: vscode.Uri) => {
      logger.debug(`File changed: ${e.fsPath}`);
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      updateTimeout = setTimeout(() => {
        logger.info('Triggering update due to file changes');
        updateIndex(context);
        updateTimeout = null;
      }, 2000);
    };

    fileWatcher.onDidChange(debouncedUpdate);
    fileWatcher.onDidCreate(debouncedUpdate);
    fileWatcher.onDidDelete(debouncedUpdate);
    
    context.subscriptions.push(fileWatcher);
  }

  // Initial index build
  logger.info('Performing initial index build');
  updateIndex(context);
}

export function deactivate() {
  logger.info('AI Contextual Linking is deactivating');
  
  // Close SQLite database connection if using SQLite
  const config = getConfiguration();
  const storageType = config.get<string>('storageType', 'json');
  
  if (storageType === 'sqlite') {
    closeDatabase();
  }
} 