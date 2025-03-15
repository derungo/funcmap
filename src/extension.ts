import * as vscode from 'vscode';
import { updateIndex, updateIndexWithRateLimit } from './commands/updateIndex';
import { logger, LogLevel } from './utils/logger';
import { getConfiguration } from './utils/config';
import { 
  getFunctionData,
  findDependentFunctions,
  findRelatedFunctions,
  findFunctionsByExecToken,
  initializeDatabase
} from './storage/sqliteStorage';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Set log level to debug for development
  logger.setLogLevel(LogLevel.debug);
  
  logger.info('Starting FuncMap activation...');
  
  try {
    // Initialize database first
    logger.debug('Initializing database...');
    await initializeDatabase();
    
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

    // Register all commands in context
    logger.debug('Adding commands to subscriptions...');
    context.subscriptions.push(
      updateIndexCommand,
      getFunctionDataCommand
    );
    
    // Set up file watchers if enabled
    const config = getConfiguration();
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