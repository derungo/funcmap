import * as vscode from 'vscode';
import { parseFilesForAITags } from '../parser/aiTagParser';
import { saveToJson } from '../storage/jsonStorage';
import { saveToSqlite } from '../storage/sqliteStorage';
import { logger } from '../utils/logger';
import { getConfiguration } from '../utils/config';

export async function updateIndex(context: vscode.ExtensionContext): Promise<void> {
  try {
    logger.info('Starting AI function registry update');
    
    // Show progress indicator
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Updating AI function registry...",
      cancellable: false
    }, async (progress) => {
      progress.report({ increment: 0 });
      
      // Parse code for AI tags
      logger.debug('Parsing files for AI tags');
      const tags = await parseFilesForAITags();
      logger.info(`Found ${tags.length} functions with AI tags`);
      progress.report({ increment: 40, message: `Found ${tags.length} functions` });
      
      // Get storage type from configuration
      const config = getConfiguration();
      const storageType = config.get<string>('storageType', 'json');
      
      // Save to appropriate storage
      if (storageType === 'sqlite') {
        logger.debug('Saving function registry to SQLite');
        await saveToSqlite(tags);
        progress.report({ increment: 60, message: 'Registry updated (SQLite)' });
      } else {
        // Default to JSON
        logger.debug('Saving function registry to JSON');
        await saveToJson(tags);
        progress.report({ increment: 60, message: 'Registry updated (JSON)' });
      }
    });
    
    logger.info('AI function registry updated successfully');
    vscode.window.showInformationMessage('AI function registry updated successfully');
  } catch (error) {
    logger.error('Failed to update AI registry', error instanceof Error ? error : new Error(String(error)));
    vscode.window.showErrorMessage(`Failed to update AI registry: ${error instanceof Error ? error.message : String(error)}`);
  }
} 