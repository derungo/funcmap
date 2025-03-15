import * as vscode from 'vscode';
import { parseFilesForAITags } from '../parser/aiTagParser';
import { saveToJson } from '../storage/jsonStorage';
import { saveToSqlite } from '../storage/sqliteStorage';
import { logger } from '../utils/logger';
import { getConfiguration } from '../utils/config';
import { debounce } from '../utils/debounce';

// Constants for progress reporting
const progressSteps = {
  init: { increment: 0, message: 'Initializing...' },
  scanning: { increment: 10, message: 'Scanning workspace...' },
  parsing: { increment: 20, message: 'Parsing files...' },
  analyzing: { increment: 40, message: 'Analyzing functions...' },
  savingJson: { increment: 60, message: 'Saving to JSON...' },
  savingSqlite: { increment: 60, message: 'Saving to SQLite...' },
  cleanup: { increment: 80, message: 'Cleaning up...' },
  complete: { increment: 100, message: 'Complete' }
};

// Rate limiting for file watching
const FILE_WATCH_DEBOUNCE_MS = 1000; // 1 second debounce

let extensionContext: vscode.ExtensionContext;

// @ai-link name=updateAIIndex
// @ai-depends on=parseAITags,saveToJson,saveToSQLite,getConfiguration
// @ai-related vscode.ProgressLocation,logger
// @ai-exec index,update
export async function updateIndex(context: vscode.ExtensionContext): Promise<void> {
  extensionContext = context;
  try {
    logger.info('Starting function registry update');
    
    // Show progress indicator
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Updating function registry...",
      cancellable: true
    }, async (progress, token) => {
      // Setup cancellation
      if (token.isCancellationRequested) {
        throw new Error('Operation cancelled by user');
      }
      
      // Initialize
      progress.report(progressSteps.init);
      
      // Scan workspace
      progress.report(progressSteps.scanning);
      const config = getConfiguration();
      const patterns = config.get<string[]>('funcmap.filePatterns', ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']);
      
      // Parse files
      progress.report(progressSteps.parsing);
      const tags = await parseFilesForAITags(patterns);
      logger.info(`Found ${tags.length} functions with AI tags`);
      
      // Analyze functions
      progress.report({
        ...progressSteps.analyzing,
        message: `Analyzing ${tags.length} functions...`
      });
      
      // Get storage type and save
      const storageType = config.get<string>('funcmap.storageType', 'json');
      
      if (token.isCancellationRequested) {
        throw new Error('Operation cancelled by user');
      }
      
      if (storageType === 'sqlite') {
        progress.report(progressSteps.savingSqlite);
        await saveToSqlite(tags);
      } else {
        progress.report(progressSteps.savingJson);
        await saveToJson(tags);
      }
      
      // Cleanup
      progress.report(progressSteps.cleanup);
      
      // Complete
      progress.report(progressSteps.complete);
      
      // Show completion message with stats
      const message = `Registry updated successfully: ${tags.length} functions indexed`;
      logger.info(message);
      vscode.window.showInformationMessage(message);
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === 'Operation cancelled by user') {
      logger.info('Registry update cancelled by user');
      vscode.window.showInformationMessage('Registry update cancelled');
    } else {
      logger.error('Failed to update registry', error);
      vscode.window.showErrorMessage(`Failed to update registry: ${error.message}`);
    }
  }
}

// Create a wrapper function that doesn't need context
async function updateIndexWrapper(): Promise<void> {
  if (!extensionContext) {
    throw new Error('Extension context not initialized');
  }
  await updateIndex(extensionContext);
}

// Export the debounced version for file watching
export const updateIndexWithRateLimit = debounce(updateIndexWrapper, FILE_WATCH_DEBOUNCE_MS); 