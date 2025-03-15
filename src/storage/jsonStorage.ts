import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AITag } from '../parser/aiTagParser';
import { logger } from '../utils/logger';

export interface AIFunctionRegistry {
  functions: AITag[];
  lastUpdated: string;
}

export async function saveToJson(tags: AITag[]): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    logger.error('No workspace folder is open');
    throw new Error('No workspace folder is open');
  }
  
  const rootPath = workspaceFolders[0].uri.fsPath;
  const registryPath = path.join(rootPath, 'ai-links.json');
  
  logger.debug(`Saving AI function registry to ${registryPath}`);
  
  const registry: AIFunctionRegistry = {
    functions: tags,
    lastUpdated: new Date().toISOString()
  };
  
  await fs.promises.writeFile(
    registryPath, 
    JSON.stringify(registry, null, 2)
  );
  
  logger.info(`AI function registry saved to ${registryPath} with ${tags.length} functions`);
}

export async function loadFromJson(): Promise<AIFunctionRegistry | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    logger.warn('No workspace folder is open, cannot load registry');
    return null;
  }
  
  const rootPath = workspaceFolders[0].uri.fsPath;
  const registryPath = path.join(rootPath, 'ai-links.json');
  
  logger.debug(`Attempting to load AI function registry from ${registryPath}`);
  
  try {
    const data = await fs.promises.readFile(registryPath, 'utf8');
    const registry = JSON.parse(data) as AIFunctionRegistry;
    logger.info(`Successfully loaded registry with ${registry.functions.length} functions`);
    return registry;
  } catch (error) {
    logger.warn('No existing registry found or error reading file: ' + (error instanceof Error ? error.message : String(error)));
    return null;
  }
}

export async function getFunctionData(functionName: string): Promise<AITag | null> {
  logger.debug(`Looking up function: ${functionName}`);
  
  const registry = await loadFromJson();
  if (!registry) {
    logger.warn(`Cannot lookup function ${functionName}: registry not found`);
    return null;
  }
  
  const func = registry.functions.find(f => f.functionName === functionName);
  
  if (func) {
    logger.debug(`Found function ${functionName} in registry`);
  } else {
    logger.debug(`Function ${functionName} not found in registry`);
  }
  
  return func || null;
} 