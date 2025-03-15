import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AITag } from '../parser/aiTagParser';
import { logger } from '../utils/logger';

// @ai-link name=AIFunctionRegistry
// @ai-related AITag
// @ai-exec storage,types
export interface AIFunctionRegistry {
  functions: AITag[];
  lastUpdated: string;
}

// Cache for the loaded registry
let registryCache: AIFunctionRegistry | null = null;

// @ai-link name=loadRegistry
// @ai-depends on=vscode.workspace.workspaceFolders,fs.promises.readFile,logger.debug,logger.error
// @ai-related AIFunctionRegistry
// @ai-exec storage,read,json
async function loadRegistry(): Promise<AIFunctionRegistry | null> {
  if (registryCache) {
    return registryCache;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    logger.error('No workspace folders found');
    return null;
  }

  const registryPath = path.join(workspaceFolders[0].uri.fsPath, 'ai-links.json');
  try {
    const data = await fs.promises.readFile(registryPath, 'utf8');
    registryCache = JSON.parse(data) as AIFunctionRegistry;
    return registryCache;
  } catch (error) {
    logger.error(`Failed to load registry: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// @ai-link name=saveToJson
// @ai-depends on=vscode.workspace.workspaceFolders,fs.promises.writeFile,logger.debug,logger.error,logger.info
// @ai-related AIFunctionRegistry,AITag
// @ai-exec storage,write,json
export async function saveToJson(tags: AITag[]): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    logger.error('No workspace folders found');
    return;
  }

  const registry: AIFunctionRegistry = {
    functions: tags,
    lastUpdated: new Date().toISOString()
  };

  const registryPath = path.join(workspaceFolders[0].uri.fsPath, 'ai-links.json');
  try {
    await fs.promises.writeFile(registryPath, JSON.stringify(registry, null, 2));
    registryCache = registry;
    logger.info('Registry saved successfully');
  } catch (error) {
    logger.error(`Failed to save registry: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// @ai-link name=getFunctionData
// @ai-depends on=loadRegistry,logger.debug
// @ai-related AITag
// @ai-exec storage,query,json
export async function getFunctionData(functionName: string): Promise<AITag | null> {
  const registry = await loadRegistry();
  if (!registry) {
    return null;
  }

  return registry.functions.find(f => f.functionName === functionName) || null;
}

// @ai-link name=findDependentFunctions
// @ai-depends on=loadRegistry,logger.debug
// @ai-related AITag
// @ai-exec storage,query,dependencies,json
export async function findDependentFunctions(functionName: string): Promise<AITag[]> {
  const registry = await loadRegistry();
  if (!registry) {
    return [];
  }

  return registry.functions.filter(f => f.dependsOn.includes(functionName));
}

// @ai-link name=findRelatedFunctions
// @ai-depends on=loadRegistry,logger.debug
// @ai-related AITag
// @ai-exec storage,query,related,json
export async function findRelatedFunctions(moduleName: string): Promise<AITag[]> {
  const registry = await loadRegistry();
  if (!registry) {
    return [];
  }

  return registry.functions.filter(f => f.related.includes(moduleName));
}

// @ai-link name=findFunctionsByExecToken
// @ai-depends on=loadRegistry,logger.debug
// @ai-related AITag
// @ai-exec storage,query,tokens,json
export async function findFunctionsByExecToken(token: string): Promise<AITag[]> {
  const registry = await loadRegistry();
  if (!registry) {
    return [];
  }

  return registry.functions.filter(f => f.execTokens.includes(token));
}

// @ai-link name=searchFunctions
// @ai-depends on=loadRegistry,logger.debug
// @ai-related AITag
// @ai-exec storage,query,search,json
export async function searchFunctions(query: string): Promise<AITag[]> {
  const registry = await loadRegistry();
  if (!registry) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  return registry.functions.filter(f => 
    f.functionName.toLowerCase().includes(lowerQuery) ||
    f.filePath.toLowerCase().includes(lowerQuery) ||
    f.dependsOn.some(d => d.toLowerCase().includes(lowerQuery)) ||
    f.related.some(r => r.toLowerCase().includes(lowerQuery)) ||
    f.execTokens.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// @ai-link name=getAllFunctions
// @ai-depends on=loadRegistry,logger.debug
// @ai-related AITag
// @ai-exec storage,query,json
export async function getAllFunctions(): Promise<AITag[]> {
  const registry = await loadRegistry();
  if (!registry) {
    return [];
  }

  return registry.functions;
} 