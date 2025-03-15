import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';
import { AITag } from '../parser/aiTagParser';
import { logger } from '../utils/logger';

// @ai-link name=AIFunctionRegistry
// @ai-related AITag
// @ai-exec storage,types
export interface AIFunctionRegistry {
  functions: AITag[];
  lastUpdated: string;
}

// @ai-link name=FunctionRow
// @ai-related AITag
// @ai-exec storage,types,database
interface FunctionRow {
  id: number;
  filePath: string;
  functionName: string;
}

// @ai-link name=DependencyRow
// @ai-related FunctionRow
// @ai-exec storage,types,database
interface DependencyRow {
  dependsOn: string;
}

// @ai-link name=RelatedRow
// @ai-related FunctionRow
// @ai-exec storage,types,database
interface RelatedRow {
  relatedTo: string;
}

// @ai-link name=ExecTokenRow
// @ai-related FunctionRow
// @ai-exec storage,types,database
interface ExecTokenRow {
  token: string;
}

// @ai-link name=MetadataRow
// @ai-related AIFunctionRegistry
// @ai-exec storage,types,database
interface MetadataRow {
  value: string;
}

let db: Database.Database | null = null;

/**
 * Initialize the SQLite database
 */
// @ai-link name=initializeDatabase
// @ai-depends on=vscode.workspace.workspaceFolders,fs.mkdirSync,Database,logger.debug,logger.error,logger.info
// @ai-related Database.Database
// @ai-exec storage,database,initialization
export async function initializeDatabase(): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      logger.error('No workspace folder is open');
      throw new Error('No workspace folder is open');
    }
    
    const rootPath = workspaceFolders[0].uri.fsPath;
    const dbPath = path.join(rootPath, 'ai-links.db');
    
    logger.debug(`Initializing SQLite database at ${dbPath}`);
    
    // Close existing connection if any
    if (db) {
      db.close();
    }
    
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Open database connection
    db = new Database(dbPath);
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS functions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filePath TEXT NOT NULL,
        functionName TEXT NOT NULL UNIQUE,
        lastUpdated TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        functionId INTEGER NOT NULL,
        dependsOn TEXT NOT NULL,
        FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE,
        UNIQUE(functionId, dependsOn)
      );
      
      CREATE TABLE IF NOT EXISTS related (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        functionId INTEGER NOT NULL,
        relatedTo TEXT NOT NULL,
        FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE,
        UNIQUE(functionId, relatedTo)
      );
      
      CREATE TABLE IF NOT EXISTS exec_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        functionId INTEGER NOT NULL,
        token TEXT NOT NULL,
        FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE,
        UNIQUE(functionId, token)
      );
      
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    
    logger.info('SQLite database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize SQLite database', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Save AI tags to SQLite database
 */
// @ai-link name=saveToSqlite
// @ai-depends on=initializeDatabase,db.prepare,db.exec,logger.debug,logger.error,logger.info
// @ai-related AITag,Database.Database
// @ai-exec storage,database,write
export async function saveToSqlite(tags: AITag[]): Promise<void> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      throw new Error('Database initialization failed');
    }
    
    logger.debug(`Saving ${tags.length} functions to SQLite database`);
    
    // Begin transaction
    db.exec('BEGIN TRANSACTION');
    
    try {
      // Clear existing data
      db.exec('DELETE FROM exec_tokens');
      db.exec('DELETE FROM related');
      db.exec('DELETE FROM dependencies');
      db.exec('DELETE FROM functions');
      
      // Prepare statements
      const insertFunction = db.prepare('INSERT INTO functions (filePath, functionName, lastUpdated) VALUES (?, ?, ?)');
      const insertDependency = db.prepare('INSERT INTO dependencies (functionId, dependsOn) VALUES (?, ?)');
      const insertRelated = db.prepare('INSERT INTO related (functionId, relatedTo) VALUES (?, ?)');
      const insertExecToken = db.prepare('INSERT INTO exec_tokens (functionId, token) VALUES (?, ?)');
      const updateMetadata = db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)');
      
      // Insert functions and their relationships
      for (const tag of tags) {
        const now = new Date().toISOString();
        
        // Insert function
        const result = insertFunction.run(tag.filePath, tag.functionName, now);
        const functionId = result.lastInsertRowid as number;
        
        // Insert dependencies
        for (const dep of tag.dependsOn) {
          insertDependency.run(functionId, dep);
        }
        
        // Insert related modules
        for (const rel of tag.related) {
          insertRelated.run(functionId, rel);
        }
        
        // Insert execution tokens
        for (const token of tag.execTokens) {
          insertExecToken.run(functionId, token);
        }
      }
      
      // Update last updated timestamp
      updateMetadata.run('lastUpdated', new Date().toISOString());
      
      // Commit transaction
      db.exec('COMMIT');
      
      logger.info(`Successfully saved ${tags.length} functions to SQLite database`);
    } catch (error) {
      // Rollback transaction on error
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Failed to save to SQLite database', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Load AI tags from SQLite database
 */
// @ai-link name=loadFromSqlite
// @ai-depends on=initializeDatabase,db.prepare,logger.debug,logger.error,logger.info
// @ai-related AIFunctionRegistry,AITag,Database.Database
// @ai-exec storage,database,read
export async function loadFromSqlite(): Promise<AIFunctionRegistry | null> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      return null;
    }
    
    logger.debug('Loading function registry from SQLite database');
    
    // Get last updated timestamp
    const metadataRow = db.prepare('SELECT value FROM metadata WHERE key = ?').get('lastUpdated') as MetadataRow | undefined;
    const lastUpdated = metadataRow ? metadataRow.value : new Date().toISOString();
    
    // Get all functions
    const functions = db.prepare(`
      SELECT f.id, f.filePath, f.functionName
      FROM functions f
    `).all() as FunctionRow[];
    
    const tags: AITag[] = [];
    
    // For each function, get its dependencies, related modules, and execution tokens
    for (const func of functions) {
      const dependencies = db.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(func.id) as DependencyRow[];
      const related = db.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(func.id) as RelatedRow[];
      const execTokens = db.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(func.id) as ExecTokenRow[];
      
      tags.push({
        filePath: func.filePath,
        functionName: func.functionName,
        dependsOn: dependencies.map((d: DependencyRow) => d.dependsOn),
        related: related.map((r: RelatedRow) => r.relatedTo),
        execTokens: execTokens.map((e: ExecTokenRow) => e.token)
      });
    }
    
    logger.info(`Successfully loaded ${tags.length} functions from SQLite database`);
    
    return {
      functions: tags,
      lastUpdated
    };
  } catch (error) {
    logger.error('Failed to load from SQLite database', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Get function data by name from SQLite database
 */
// @ai-link name=getFunctionDataFromSqlite
// @ai-depends on=initializeDatabase,db.prepare,logger.debug,logger.error
// @ai-related AITag,Database.Database
// @ai-exec storage,database,query
export async function getFunctionDataFromSqlite(functionName: string): Promise<AITag | null> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      return null;
    }
    
    logger.debug(`Looking up function: ${functionName} in SQLite database`);
    
    // Get function
    const func = db.prepare('SELECT id, filePath, functionName FROM functions WHERE functionName = ?').get(functionName) as FunctionRow | undefined;
    
    if (!func) {
      logger.debug(`Function ${functionName} not found in SQLite database`);
      return null;
    }
    
    // Get dependencies, related modules, and execution tokens
    const dependencies = db.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(func.id) as DependencyRow[];
    const related = db.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(func.id) as RelatedRow[];
    const execTokens = db.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(func.id) as ExecTokenRow[];
    
    logger.debug(`Found function ${functionName} in SQLite database`);
    
    return {
      filePath: func.filePath,
      functionName: func.functionName,
      dependsOn: dependencies.map((d: DependencyRow) => d.dependsOn),
      related: related.map((r: RelatedRow) => r.relatedTo),
      execTokens: execTokens.map((e: ExecTokenRow) => e.token)
    };
  } catch (error) {
    logger.error('Failed to get function data from SQLite database', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Find functions that depend on a specific function
 */
// @ai-link name=findDependentFunctions
// @ai-depends on=initializeDatabase,db.prepare,logger.debug,logger.error
// @ai-related AITag,Database.Database
// @ai-exec storage,database,query,dependencies
export async function findDependentFunctions(functionName: string): Promise<AITag[]> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      return [];
    }
    
    logger.debug(`Finding functions that depend on: ${functionName}`);
    
    // Get functions that depend on the specified function
    const functions = db.prepare(`
      SELECT f.id, f.filePath, f.functionName
      FROM functions f
      JOIN dependencies d ON f.id = d.functionId
      WHERE d.dependsOn = ?
    `).all(functionName) as FunctionRow[];
    
    const tags: AITag[] = [];
    
    // For each function, get its dependencies, related modules, and execution tokens
    for (const func of functions) {
      const dependencies = db.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(func.id) as DependencyRow[];
      const related = db.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(func.id) as RelatedRow[];
      const execTokens = db.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(func.id) as ExecTokenRow[];
      
      tags.push({
        filePath: func.filePath,
        functionName: func.functionName,
        dependsOn: dependencies.map((d: DependencyRow) => d.dependsOn),
        related: related.map((r: RelatedRow) => r.relatedTo),
        execTokens: execTokens.map((e: ExecTokenRow) => e.token)
      });
    }
    
    logger.info(`Found ${tags.length} functions that depend on ${functionName}`);
    
    return tags;
  } catch (error) {
    logger.error('Failed to find dependent functions', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Find functions related to a specific module
 */
// @ai-link name=findRelatedFunctions
// @ai-depends on=initializeDatabase,db.prepare,logger.debug,logger.error
// @ai-related AITag,Database.Database
// @ai-exec storage,database,query,related
export async function findRelatedFunctions(moduleName: string): Promise<AITag[]> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      return [];
    }
    
    logger.debug(`Finding functions related to module: ${moduleName}`);
    
    // Get functions related to the specified module
    const functions = db.prepare(`
      SELECT f.id, f.filePath, f.functionName
      FROM functions f
      JOIN related r ON f.id = r.functionId
      WHERE r.relatedTo = ?
    `).all(moduleName) as FunctionRow[];
    
    const tags: AITag[] = [];
    
    // For each function, get its dependencies, related modules, and execution tokens
    for (const func of functions) {
      const dependencies = db.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(func.id) as DependencyRow[];
      const related = db.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(func.id) as RelatedRow[];
      const execTokens = db.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(func.id) as ExecTokenRow[];
      
      tags.push({
        filePath: func.filePath,
        functionName: func.functionName,
        dependsOn: dependencies.map((d: DependencyRow) => d.dependsOn),
        related: related.map((r: RelatedRow) => r.relatedTo),
        execTokens: execTokens.map((e: ExecTokenRow) => e.token)
      });
    }
    
    logger.info(`Found ${tags.length} functions related to module ${moduleName}`);
    
    return tags;
  } catch (error) {
    logger.error('Failed to find related functions', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Find functions with a specific execution token
 */
// @ai-link name=findFunctionsByExecToken
// @ai-depends on=initializeDatabase,db.prepare,logger.debug,logger.error
// @ai-related AITag,Database.Database
// @ai-exec storage,database,query,tokens
export async function findFunctionsByExecToken(token: string): Promise<AITag[]> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      return [];
    }
    
    logger.debug(`Finding functions with execution token: ${token}`);
    
    // Get functions with the specified execution token
    const functions = db.prepare(`
      SELECT f.id, f.filePath, f.functionName
      FROM functions f
      JOIN exec_tokens e ON f.id = e.functionId
      WHERE e.token = ?
    `).all(token) as FunctionRow[];
    
    const tags: AITag[] = [];
    
    // For each function, get its dependencies, related modules, and execution tokens
    for (const func of functions) {
      const dependencies = db.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(func.id) as DependencyRow[];
      const related = db.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(func.id) as RelatedRow[];
      const execTokens = db.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(func.id) as ExecTokenRow[];
      
      tags.push({
        filePath: func.filePath,
        functionName: func.functionName,
        dependsOn: dependencies.map((d: DependencyRow) => d.dependsOn),
        related: related.map((r: RelatedRow) => r.relatedTo),
        execTokens: execTokens.map((e: ExecTokenRow) => e.token)
      });
    }
    
    logger.info(`Found ${tags.length} functions with execution token ${token}`);
    
    return tags;
  } catch (error) {
    logger.error('Failed to find functions by execution token', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Get function data by name (wrapper function)
 */
// @ai-link name=getFunctionData
// @ai-depends on=getFunctionDataFromSqlite,logger.debug,logger.error
// @ai-related AITag
// @ai-exec storage,database,query,wrapper
export async function getFunctionData(functionName: string): Promise<AITag | null> {
  try {
    if (!db) {
      await initializeDatabase();
    }
    
    if (!db) {
      return null;
    }
    
    logger.debug(`Getting data for function: ${functionName}`);
    
    // Get function data
    const func = db.prepare(`
      SELECT id, filePath, functionName
      FROM functions
      WHERE functionName = ?
    `).get(functionName) as FunctionRow | undefined;
    
    if (!func) {
      return null;
    }
    
    // Get dependencies, related modules, and execution tokens
    const dependencies = db.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(func.id) as DependencyRow[];
    const related = db.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(func.id) as RelatedRow[];
    const execTokens = db.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(func.id) as ExecTokenRow[];
    
    const tag: AITag = {
      filePath: func.filePath,
      functionName: func.functionName,
      dependsOn: dependencies.map((d: DependencyRow) => d.dependsOn),
      related: related.map((r: RelatedRow) => r.relatedTo),
      execTokens: execTokens.map((e: ExecTokenRow) => e.token)
    };
    
    logger.info(`Found function data for ${functionName}`);
    
    return tag;
  } catch (error) {
    logger.error('Failed to get function data', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Close the database connection
 */
// @ai-link name=closeDatabase
// @ai-depends on=db.close,logger.debug
// @ai-related Database.Database
// @ai-exec storage,database,cleanup
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.debug('SQLite database connection closed');
  }
}

// @ai-link name=searchFunctions
// @ai-depends on=db,logger.debug,logger.error
// @ai-related AITag,FunctionRow,DependencyRow,RelatedRow,ExecTokenRow
// @ai-exec storage,query,search,sqlite
export async function searchFunctions(query: string): Promise<AITag[]> {
  if (!db) {
    logger.error('Database not initialized');
    return [];
  }

  const database = db;

  try {
    const lowerQuery = query.toLowerCase();
    const rows = database.prepare(`
      SELECT DISTINCT f.id, f.filePath, f.functionName
      FROM functions f
      LEFT JOIN dependencies d ON f.id = d.functionId
      LEFT JOIN related r ON f.id = r.functionId
      LEFT JOIN exec_tokens e ON f.id = e.functionId
      WHERE LOWER(f.functionName) LIKE ?
         OR LOWER(f.filePath) LIKE ?
         OR LOWER(d.dependsOn) LIKE ?
         OR LOWER(r.relatedTo) LIKE ?
         OR LOWER(e.token) LIKE ?
    `).all(`%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`) as FunctionRow[];

    return await Promise.all(rows.map(async (row: FunctionRow) => {
      const dependsOnRows = database.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(row.id) as { dependsOn: string }[];
      const relatedRows = database.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(row.id) as { relatedTo: string }[];
      const execTokenRows = database.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(row.id) as { token: string }[];

      return {
        filePath: row.filePath,
        functionName: row.functionName,
        dependsOn: dependsOnRows.map(d => d.dependsOn),
        related: relatedRows.map(r => r.relatedTo),
        execTokens: execTokenRows.map(e => e.token)
      };
    }));
  } catch (error) {
    logger.error(`Failed to search functions: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// @ai-link name=getAllFunctions
// @ai-depends on=db,logger.debug,logger.error
// @ai-related AITag,FunctionRow,DependencyRow,RelatedRow,ExecTokenRow
// @ai-exec storage,query,sqlite
export async function getAllFunctions(): Promise<AITag[]> {
  if (!db) {
    logger.error('Database not initialized');
    return [];
  }

  const database = db;

  try {
    const rows = database.prepare('SELECT id, filePath, functionName FROM functions').all() as FunctionRow[];

    return await Promise.all(rows.map(async (row: FunctionRow) => {
      const dependsOnRows = database.prepare('SELECT dependsOn FROM dependencies WHERE functionId = ?').all(row.id) as { dependsOn: string }[];
      const relatedRows = database.prepare('SELECT relatedTo FROM related WHERE functionId = ?').all(row.id) as { relatedTo: string }[];
      const execTokenRows = database.prepare('SELECT token FROM exec_tokens WHERE functionId = ?').all(row.id) as { token: string }[];

      return {
        filePath: row.filePath,
        functionName: row.functionName,
        dependsOn: dependsOnRows.map(d => d.dependsOn),
        related: relatedRows.map(r => r.relatedTo),
        execTokens: execTokenRows.map(e => e.token)
      };
    }));
  } catch (error) {
    logger.error(`Failed to get all functions: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
} 