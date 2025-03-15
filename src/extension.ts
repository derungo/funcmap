import * as vscode from 'vscode';
import { updateIndex, updateIndexWithRateLimit } from './commands/updateIndex';
import { logger } from './utils/logger';
import { getConfiguration } from './utils/config';
import { 
  getFunctionData,
  findDependentFunctions,
  findRelatedFunctions,
  findFunctionsByExecToken
} from './storage/sqliteStorage';

export function activate(context: vscode.ExtensionContext): void {
  logger.info('FuncMap is now active');

  // Register the update index command
  const updateIndexCommand = vscode.commands.registerCommand(
    'funcmap.updateIndex',
    async () => {
      try {
        await updateIndex(context);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to update index: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Register lowercase alias for backward compatibility
  const updateIndexCommandLowercase = vscode.commands.registerCommand(
    'funcmap.updateindex',
    () => updateIndex(context)
  );

  context.subscriptions.push(updateIndexCommand);
  context.subscriptions.push(updateIndexCommandLowercase);

  // Register query commands
  const getFunctionDataCommand = vscode.commands.registerCommand(
    'funcmap.getFunctionData',
    async () => {
      try {
        const functionName = await vscode.window.showInputBox({
          prompt: 'Enter function name',
          placeHolder: 'e.g., updateIndex'
        });
        
        if (!functionName) {
          return;
        }
        
        const data = await getFunctionData(functionName);
        if (data) {
          // Show results in a new editor
          const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(data, null, 2),
            language: 'json'
          });
          await vscode.window.showTextDocument(doc);
        } else {
          vscode.window.showInformationMessage(`No data found for function: ${functionName}`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to get function data: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  const findDependentFunctionsCommand = vscode.commands.registerCommand(
    'funcmap.findDependentFunctions',
    async () => {
      try {
        const functionName = await vscode.window.showInputBox({
          prompt: 'Enter function name',
          placeHolder: 'e.g., updateIndex'
        });
        
        if (!functionName) {
          return;
        }
        
        const functions = await findDependentFunctions(functionName);
        if (functions.length > 0) {
          // Show results in a new editor
          const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(functions, null, 2),
            language: 'json'
          });
          await vscode.window.showTextDocument(doc);
        } else {
          vscode.window.showInformationMessage(`No dependent functions found for: ${functionName}`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to find dependent functions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  const findRelatedFunctionsCommand = vscode.commands.registerCommand(
    'funcmap.findRelatedFunctions',
    async () => {
      try {
        const moduleName = await vscode.window.showInputBox({
          prompt: 'Enter module name',
          placeHolder: 'e.g., logger'
        });
        
        if (!moduleName) {
          return;
        }
        
        const functions = await findRelatedFunctions(moduleName);
        if (functions.length > 0) {
          // Show results in a new editor
          const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(functions, null, 2),
            language: 'json'
          });
          await vscode.window.showTextDocument(doc);
        } else {
          vscode.window.showInformationMessage(`No related functions found for module: ${moduleName}`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to find related functions: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  const findFunctionsByExecTokenCommand = vscode.commands.registerCommand(
    'funcmap.findFunctionsByExecToken',
    async () => {
      try {
        const token = await vscode.window.showInputBox({
          prompt: 'Enter execution token',
          placeHolder: 'e.g., parse'
        });
        
        if (!token) {
          return;
        }
        
        const functions = await findFunctionsByExecToken(token);
        if (functions.length > 0) {
          // Show results in a new editor
          const doc = await vscode.workspace.openTextDocument({
            content: JSON.stringify(functions, null, 2),
            language: 'json'
          });
          await vscode.window.showTextDocument(doc);
        } else {
          vscode.window.showInformationMessage(`No functions found with execution token: ${token}`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to find functions by execution token: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Register all commands
  context.subscriptions.push(
    updateIndexCommand,
    getFunctionDataCommand,
    findDependentFunctionsCommand,
    findRelatedFunctionsCommand,
    findFunctionsByExecTokenCommand
  );

  // Set up file watchers if enabled
  const config = getConfiguration();
  if (config.get<boolean>('watchFiles', true)) {
    const filePatterns = config.get<string[]>('filePatterns', ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']);
    logger.debug(`Setting up file watchers for patterns: ${filePatterns.join(', ')}`);
    
    const fileWatcher = vscode.workspace.createFileSystemWatcher(`{${filePatterns.join(',')}}`);
    
    fileWatcher.onDidChange(updateIndexWithRateLimit);
    fileWatcher.onDidCreate(updateIndexWithRateLimit);
    fileWatcher.onDidDelete(updateIndexWithRateLimit);
    
    context.subscriptions.push(fileWatcher);
  }

  // Initial index build
  logger.info('Performing initial index build');
  updateIndex(context);
}

export function deactivate(): void {
  logger.info('FuncMap is deactivating');
  
  // Clean up resources
} 