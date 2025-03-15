import * as vscode from 'vscode';
import { logger } from '../utils/logger';

export interface AITag {
  filePath: string;
  functionName: string;
  dependsOn: string[];
  related: string[];
  execTokens: string[];
}

// @ai-link name=parseAITags
// @ai-depends on=vscode.workspace.findFiles,vscode.workspace.openTextDocument
// @ai-related AITag,logger
// @ai-exec parse,index
export async function parseFilesForAITags(filePatterns: string[] = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']): Promise<AITag[]> {
  const tags: AITag[] = [];
  
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
      let inClassDefinition = false;
      let currentClassName = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for class definitions
        const classMatch = line.match(/class\s+(\w+)/);
        if (classMatch) {
          inClassDefinition = true;
          currentClassName = classMatch[1];
          logger.debug(`Found class: ${currentClassName} in ${file.fsPath}`);
          continue;
        }
        
        // Look for function declarations
        // This is a simplified approach - a more robust implementation would use an AST parser
        const functionMatch = line.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*\(|async\s+function\s+(\w+)/);
        if (functionMatch) {
          const functionName = functionMatch[1] || functionMatch[2] || functionMatch[3];
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
        
        // Look for class methods
        if (inClassDefinition) {
          // Match regular methods, async methods, and arrow function properties
          const methodMatch = line.match(/(?:async\s+)?(\w+)\s*\(|(\w+)\s*=\s*(?:async\s*)?\(/);
          if (methodMatch) {
            const methodName = methodMatch[1] || methodMatch[2];
            if (methodName && !['constructor', 'if', 'for', 'while', 'switch'].includes(methodName)) {
              logger.debug(`Found class method: ${methodName} in class ${currentClassName} in ${file.fsPath}`);
              const fullMethodName = `${currentClassName}.${methodName}`;
              currentFunction = {
                name: methodName,
                tags: {
                  filePath: file.fsPath,
                  functionName: fullMethodName,
                  dependsOn: [],
                  related: [],
                  execTokens: []
                }
              };
              tags.push(currentFunction.tags);
            }
          }
          
          // Check for end of class definition
          if (line.includes('}') && !line.includes('{')) {
            const openBraces = line.split('{').length - 1;
            const closeBraces = line.split('}').length - 1;
            if (closeBraces > openBraces) {
              inClassDefinition = false;
              currentClassName = '';
            }
          }
        }
        
        // Look for AI tags
        if (currentFunction) {
          // @ai-link name=X
          const linkMatch = line.match(/@ai-link(?:\s+name=(\w+))?/);
          if (linkMatch) {
            if (linkMatch[1]) {
              logger.debug(`Found @ai-link: ${linkMatch[1]} for function ${currentFunction.name}`);
              currentFunction.tags.functionName = linkMatch[1];
            } else {
              logger.debug(`Found @ai-link for function ${currentFunction.name}`);
            }
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