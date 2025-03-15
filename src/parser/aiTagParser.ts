import * as vscode from 'vscode';
import { logger } from '../utils/logger';

// @ai-link name=AITag
// @ai-related vscode.Uri
// @ai-exec types,core
export interface AITag {
  filePath: string;
  functionName: string;
  dependsOn: string[];
  related: string[];
  execTokens: string[];
}

// @ai-link name=parseFilesForAITags
// @ai-depends on=vscode.workspace.findFiles,vscode.workspace.openTextDocument,logger.debug,logger.info,logger.error
// @ai-related AITag,vscode.TextDocument
// @ai-exec parse,index,core
export async function parseFilesForAITags(filePatterns: string[] = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.py']): Promise<AITag[]> {
  const tags: AITag[] = [];
  
  logger.debug(`Using file patterns: ${filePatterns.join(', ')}`);
  
  // Exclude node_modules and Python virtual environments
  const files = await vscode.workspace.findFiles(
    `{${filePatterns.join(',')}}`, 
    '{**/node_modules/**,**/.venv/**,**/venv/**,**/__pycache__/**}'
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
      let indentationLevel = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for class definitions
        const classMatch = line.match(/(?:class\s+(\w+))|(?:^class\s+(\w+)\s*[:\(])/);
        if (classMatch) {
          inClassDefinition = true;
          currentClassName = classMatch[1] || classMatch[2];
          logger.debug(`Found class: ${currentClassName} in ${file.fsPath}`);
          continue;
        }
        
        // Look for function declarations including Python's def
        const functionMatch = line.match(/(?:function\s+(\w+))|(?:const\s+(\w+)\s*=\s*\()|(?:async\s+function\s+(\w+))|(?:def\s+(\w+)\s*\()/);
        if (functionMatch) {
          const functionName = functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4];
          logger.debug(`Found function: ${functionName} in ${file.fsPath}`);
          
          // For Python, track indentation level
          if (file.fsPath.endsWith('.py')) {
            indentationLevel = line.search(/\S/);
          }
          
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
          continue;
        }
        
        // For Python files, check if we've exited the function based on indentation
        if (currentFunction && file.fsPath.endsWith('.py')) {
          const currentIndentation = line.search(/\S/);
          if (currentIndentation !== -1 && currentIndentation <= indentationLevel && line.trim().length > 0) {
            currentFunction = null;
            continue;
          }
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