import * as vscode from 'vscode';
import { updateIndex } from './commands/updateIndex';
import { logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext) {
  logger.info('AI Contextual Linking is now active');

  // Register the update index command
  const updateIndexCommand = vscode.commands.registerCommand(
    'aiContextualLinking.updateIndex',
    () => updateIndex(context)
  );

  context.subscriptions.push(updateIndexCommand);

  // Set up file watchers if enabled
  const config = vscode.workspace.getConfiguration('aiContextualLinking');
  if (config.get<boolean>('watchFiles', true)) {
    const filePatterns = config.get<string[]>('filePatterns', ['**/*.js', '**/*.ts']);
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
  // Clean up resources if needed
} 