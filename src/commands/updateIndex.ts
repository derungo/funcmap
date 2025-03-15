import * as vscode from 'vscode';
import { parseFilesForAITags } from '../parser/aiTagParser';
import { saveToJson } from '../storage/jsonStorage';
import { saveToSqlite } from '../storage/sqliteStorage';
import { logger } from '../utils/logger';
import { getConfiguration } from '../utils/config';
import { debounce } from '../utils/debounce';

// Access the active storage type from the extension
import { activeStorageType, setActiveStorageType } from '../extension';

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
      
      // Get the active storage type and save data
      if (token.isCancellationRequested) {
        throw new Error('Operation cancelled by user');
      }
      
      try {
        if (activeStorageType === 'sqlite') {
          progress.report(progressSteps.savingSqlite);
          await saveToSqlite(tags);
          logger.info(`Saved ${tags.length} functions to SQLite database`);
        } else {
          progress.report(progressSteps.savingJson);
          await saveToJson(tags);
          logger.info(`Saved ${tags.length} functions to JSON file`);
        }
      } catch (saveError) {
        // If saving to SQLite fails, try JSON as a fallback
        if (activeStorageType === 'sqlite') {
          logger.error(`Failed to save to SQLite: ${saveError instanceof Error ? saveError.message : String(saveError)}`);
          logger.info('Falling back to JSON storage');
          progress.report(progressSteps.savingJson);
          await saveToJson(tags);
          
          // Update the global storage type
          setActiveStorageType('json');
          await config.update('storageType', 'json', vscode.ConfigurationTarget.Workspace);
        } else {
          // If JSON also fails, re-throw the error
          throw saveError;
        }
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