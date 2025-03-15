import * as vscode from 'vscode';
import { updateIndex, updateIndexWithRateLimit } from './commands/updateIndex';
import { logger, LogLevel } from './utils/logger';
import { getConfiguration } from './utils/config';
import { 
  getFunctionData as getSqliteFunctionData,
  findDependentFunctions as findSqliteDependentFunctions,
  findRelatedFunctions as findSqliteRelatedFunctions,
  findFunctionsByExecToken as findSqliteFunctionsByExecToken,
  initializeDatabase
} from './storage/sqliteStorage';
import {
  getFunctionData as getJsonFunctionData
} from './storage/jsonStorage';

// Store the storage type that's actually in use
export let activeStorageType: 'json' | 'sqlite' = 'json';

// Function to update the storage type
export function setActiveStorageType(type: 'json' | 'sqlite'): void {
  activeStorageType = type;
  logger.info(`Storage type set to: ${type}`);
}

// Create unified function interfaces that use the active storage type
export async function getFunctionData(functionName: string): Promise<any> {
  if (activeStorageType === 'sqlite') {
    return getSqliteFunctionData(functionName);
  } else {
    return getJsonFunctionData(functionName);
  }
}

export async function findDependentFunctions(functionName: string): Promise<any[]> {
  if (activeStorageType === 'sqlite') {
    return findSqliteDependentFunctions(functionName);
  } else {
    // Implement JSON-based fallback if needed or inform user about limitations
    vscode.window.showWarningMessage('Advanced function querying requires SQLite storage. Please check extension settings.');
    return [];
  }
}

export async function findRelatedFunctions(moduleName: string): Promise<any[]> {
  if (activeStorageType === 'sqlite') {
    return findSqliteRelatedFunctions(moduleName);
  } else {
    // Implement JSON-based fallback if needed or inform user about limitations
    vscode.window.showWarningMessage('Advanced function querying requires SQLite storage. Please check extension settings.');
    return [];
  }
}

export async function findFunctionsByExecToken(token: string): Promise<any[]> {
  if (activeStorageType === 'sqlite') {
    return findSqliteFunctionsByExecToken(token);
  } else {
    // Implement JSON-based fallback if needed or inform user about limitations
    vscode.window.showWarningMessage('Advanced function querying requires SQLite storage. Please check extension settings.');
    return [];
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Set log level to debug for development
  logger.setLogLevel(LogLevel.debug);
  
  logger.info('Starting FuncMap activation...');
  
  try {
    // Get the configured storage type
    const config = getConfiguration();
    const configuredStorageType = config.get<string>('storageType', 'json');
    activeStorageType = configuredStorageType as 'json' | 'sqlite';
    
    // Initialize database if needed
    if (activeStorageType === 'sqlite') {
      logger.debug('Initializing database...');
      try {
        await initializeDatabase();
        logger.info('SQLite database initialized successfully');
      } catch (dbError) {
        const errorMsg = `Failed to initialize SQLite database: ${dbError instanceof Error ? dbError.message : String(dbError)}`;
        logger.error(errorMsg);
        vscode.window.showWarningMessage(`${errorMsg}. Falling back to JSON storage.`);
        
        // Fall back to JSON storage
        activeStorageType = 'json';
        await config.update('storageType', 'json', vscode.ConfigurationTarget.Workspace);
        logger.info('Switched to JSON storage due to SQLite initialization failure');
      }
    }
    
    logger.debug('Registering commands...');
    
    // Register the update index command
    const updateIndexCommand = vscode.commands.registerCommand(
      'funcmap.updateIndex',
      async () => {
        logger.debug('Executing updateIndex command...');
        try {
          await updateIndex(context);
        } catch (error) {
          const errorMsg = `Failed to update index: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          vscode.window.showErrorMessage(errorMsg);
        }
      }
    );
    logger.debug('Registered updateIndex command');

    // Register query commands
    const getFunctionDataCommand = vscode.commands.registerCommand(
      'funcmap.getFunctionData',
      async () => {
        logger.debug('Executing getFunctionData command...');
        try {
          const functionName = await vscode.window.showInputBox({
            prompt: 'Enter function name',
            placeHolder: 'e.g., updateIndex'
          });
          
          if (!functionName) {
            logger.debug('getFunctionData: No function name provided');
            return;
          }
          
          logger.debug(`Looking up function: ${functionName}`);
          const data = await getFunctionData(functionName);
          if (data) {
            logger.debug(`Found data for function: ${functionName}`);
            const doc = await vscode.workspace.openTextDocument({
              content: JSON.stringify(data, null, 2),
              language: 'json'
            });
            await vscode.window.showTextDocument(doc);
          } else {
            const msg = `No data found for function: ${functionName}`;
            logger.debug(msg);
            vscode.window.showInformationMessage(msg);
          }
        } catch (error) {
          const errorMsg = `Failed to get function data: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          vscode.window.showErrorMessage(errorMsg);
        }
      }
    );
    logger.debug('Registered getFunctionData command');

    // Register find dependent functions command
    const findDependentFunctionsCommand = vscode.commands.registerCommand(
      'funcmap.findDependentFunctions',
      async () => {
        logger.debug('Executing findDependentFunctions command...');
        try {
          const functionName = await vscode.window.showInputBox({
            prompt: 'Enter function name',
            placeHolder: 'e.g., updateIndex'
          });
          
          if (!functionName) {
            logger.debug('findDependentFunctions: No function name provided');
            return;
          }
          
          logger.debug(`Looking up dependencies for function: ${functionName}`);
          const dependentFunctions = await findDependentFunctions(functionName);
          if (dependentFunctions && dependentFunctions.length > 0) {
            logger.debug(`Found ${dependentFunctions.length} dependent functions for: ${functionName}`);
            const doc = await vscode.workspace.openTextDocument({
              content: JSON.stringify(dependentFunctions, null, 2),
              language: 'json'
            });
            await vscode.window.showTextDocument(doc);
          } else {
            const msg = `No dependent functions found for: ${functionName}`;
            logger.debug(msg);
            vscode.window.showInformationMessage(msg);
          }
        } catch (error) {
          const errorMsg = `Failed to find dependent functions: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          vscode.window.showErrorMessage(errorMsg);
        }
      }
    );
    
    // Register find related functions command
    const findRelatedFunctionsCommand = vscode.commands.registerCommand(
      'funcmap.findRelatedFunctions',
      async () => {
        logger.debug('Executing findRelatedFunctions command...');
        try {
          const moduleName = await vscode.window.showInputBox({
            prompt: 'Enter module name',
            placeHolder: 'e.g., UserModel'
          });
          
          if (!moduleName) {
            logger.debug('findRelatedFunctions: No module name provided');
            return;
          }
          
          logger.debug(`Looking up functions related to module: ${moduleName}`);
          const relatedFunctions = await findRelatedFunctions(moduleName);
          if (relatedFunctions && relatedFunctions.length > 0) {
            logger.debug(`Found ${relatedFunctions.length} functions related to: ${moduleName}`);
            const doc = await vscode.workspace.openTextDocument({
              content: JSON.stringify(relatedFunctions, null, 2),
              language: 'json'
            });
            await vscode.window.showTextDocument(doc);
          } else {
            const msg = `No functions found related to: ${moduleName}`;
            logger.debug(msg);
            vscode.window.showInformationMessage(msg);
          }
        } catch (error) {
          const errorMsg = `Failed to find related functions: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          vscode.window.showErrorMessage(errorMsg);
        }
      }
    );
    
    // Register find functions by execution token command
    const findFunctionsByExecTokenCommand = vscode.commands.registerCommand(
      'funcmap.findFunctionsByExecToken',
      async () => {
        logger.debug('Executing findFunctionsByExecToken command...');
        try {
          const token = await vscode.window.showInputBox({
            prompt: 'Enter execution token',
            placeHolder: 'e.g., test'
          });
          
          if (!token) {
            logger.debug('findFunctionsByExecToken: No token provided');
            return;
          }
          
          logger.debug(`Looking up functions with execution token: ${token}`);
          const functions = await findFunctionsByExecToken(token);
          if (functions && functions.length > 0) {
            logger.debug(`Found ${functions.length} functions with execution token: ${token}`);
            const doc = await vscode.workspace.openTextDocument({
              content: JSON.stringify(functions, null, 2),
              language: 'json'
            });
            await vscode.window.showTextDocument(doc);
          } else {
            const msg = `No functions found with execution token: ${token}`;
            logger.debug(msg);
            vscode.window.showInformationMessage(msg);
          }
        } catch (error) {
          const errorMsg = `Failed to find functions by execution token: ${error instanceof Error ? error.message : String(error)}`;
          logger.error(errorMsg);
          vscode.window.showErrorMessage(errorMsg);
        }
      }
    );
    
    // Register all commands in context
    logger.debug('Adding commands to subscriptions...');
    context.subscriptions.push(
      updateIndexCommand,
      getFunctionDataCommand,
      findDependentFunctionsCommand,
      findRelatedFunctionsCommand,
      findFunctionsByExecTokenCommand
    );
    
    // Set up file watchers if enabled
    if (config.get<boolean>('watchFiles', true)) {
      const filePatterns = config.get<string[]>('filePatterns', ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']);
      logger.debug(`Setting up file watchers for patterns: ${filePatterns.join(', ')}`);
      
      const fileWatcher = vscode.workspace.createFileSystemWatcher(`{${filePatterns.join(',')}}`);
      
      fileWatcher.onDidChange((uri) => {
        logger.debug(`File changed: ${uri.fsPath}`);
        updateIndexWithRateLimit();
      });
      fileWatcher.onDidCreate((uri) => {
        logger.debug(`File created: ${uri.fsPath}`);
        updateIndexWithRateLimit();
      });
      fileWatcher.onDidDelete((uri) => {
        logger.debug(`File deleted: ${uri.fsPath}`);
        updateIndexWithRateLimit();
      });
      
      context.subscriptions.push(fileWatcher);
      logger.debug('File watchers registered');
    }

    // Initial index build
    logger.info('Starting initial index build...');
    await updateIndex(context);
    
    logger.info('FuncMap activation completed successfully');
  } catch (error) {
    const errorMsg = `Failed to activate FuncMap: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMsg);
    vscode.window.showErrorMessage(errorMsg);
    throw error; // Re-throw to notify VS Code of activation failure
  }
}

export function deactivate(): void {
  logger.info('FuncMap is deactivating');
} 