import * as vscode from 'vscode';
import { logger } from '../utils/logger';

export interface AITag {
  filePath: string;
  functionName: string;
  dependsOn: string[];
  related: string[];
  execTokens: string[];
}

export async function parseFilesForAITags(): Promise<AITag[]> {
  const tags: AITag[] = [];
  
  // Get all files matching patterns from configuration
  const config = vscode.workspace.getConfiguration('aiContextualLinking');
  const filePatterns = config.get<string[]>('filePatterns', ['**/*.js', '**/*.ts']);
  
  logger.debug(`Using file patterns: ${filePatterns.join(', ')}`);
  
  // Exclude node_modules
  const files = await vscode.workspace.findFiles(
    `{${filePatterns.join(',')}}`, 
    '**/node_modules/**'
  );
  
  logger.info(`Found ${files.length} files to parse`);
  
  for (const file of files) {
    try {
      logger.debug(`Parsing file: ${file.fsPath}`);
      const document = await vscode.workspace.openTextDocument(file);
      const text = document.getText();
      const lines = text.split(/\r?\n/);
      
      let currentFunction: { name: string, tags: AITag } | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for function declarations
        // This is a simplified approach - a more robust implementation would use an AST parser
        const functionMatch = line.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*\(/);
        if (functionMatch) {
          const functionName = functionMatch[1] || functionMatch[2];
          logger.debug(`Found function: ${functionName} in ${file.fsPath}`);
          currentFunction = {
            name: functionName,
            tags: {
              filePath: file.fsPath,
              functionName,
              dependsOn: [],
              related: [],
              execTokens: []
            }
          };
          tags.push(currentFunction.tags);
        }
        
        // Look for AI tags
        if (currentFunction) {
          // @ai-link name=X
          const linkMatch = line.match(/@ai-link(?:\s+name=(\w+))?/);
          if (linkMatch && linkMatch[1]) {
            logger.debug(`Found @ai-link: ${linkMatch[1]} for function ${currentFunction.name}`);
            currentFunction.tags.functionName = linkMatch[1];
          }
          
          // @ai-depends on=X,Y,Z
          const dependsMatch = line.match(/@ai-depends\s+on=([\w,]+)/);
          if (dependsMatch) {
            logger.debug(`Found @ai-depends: ${dependsMatch[1]} for function ${currentFunction.name}`);
            currentFunction.tags.dependsOn = dependsMatch[1].split(',');
          }
          
          // @ai-related X,Y,Z
          const relatedMatch = line.match(/@ai-related\s+([\w,]+)/);
          if (relatedMatch) {
            logger.debug(`Found @ai-related: ${relatedMatch[1]} for function ${currentFunction.name}`);
            currentFunction.tags.related = relatedMatch[1].split(',');
          }
          
          // @ai-exec X,Y,Z
          const execMatch = line.match(/@ai-exec\s+([\w,]+)/);
          if (execMatch) {
            logger.debug(`Found @ai-exec: ${execMatch[1]} for function ${currentFunction.name}`);
            currentFunction.tags.execTokens = execMatch[1].split(',');
          }
        }
      }
    } catch (error) {
      logger.error(`Error parsing file ${file.fsPath}`, error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  return tags;
} 