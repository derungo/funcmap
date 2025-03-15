# Architecture Overview

## System Components

### 1. Parser System
The parser scans your codebase for AI-specific tags:
- `@ai-link`: Identifies a function to be indexed (can specify an alternative name with `name=functionName`)
- `@ai-depends`: Specifies dependencies on other functions (format: `on=function1,function2`)
- `@ai-related`: Links to related modules or classes (format: `Module1,Class2`)
- `@ai-exec`: Defines execution tokens for automation (format: `test,benchmark,coverage`)

The parser is implemented in `src/parser/aiTagParser.ts` and uses a simplified approach to detect functions and their associated AI tags. It now supports:
- Regular function declarations
- Arrow function expressions
- Async functions
- Class methods

### 2. Storage Layer
The extension supports two storage options:

#### JSON Storage
- Simple file-based storage in `ai-links.json`
- Good for small to medium-sized projects
- Implemented in `src/storage/jsonStorage.ts`

#### SQLite Storage
- Database-backed storage in `ai-links.db`
- Better performance for large codebases
- Supports complex queries for dependency analysis
- Implemented in `src/storage/sqliteStorage.ts`

The storage type can be configured in the extension settings.

### 3. Extension Commands
- `aiContextualLinking.updateIndex`: Scans the codebase and updates the function registry
- `aiContextualLinking.getFunctionData`: Gets data for a specific function
- `aiContextualLinking.findDependentFunctions`: Finds functions that depend on a specific function
- `aiContextualLinking.findRelatedFunctions`: Finds functions related to a specific module
- `aiContextualLinking.findFunctionsByExecToken`: Finds functions with a specific execution token

### 4. File Watchers
The extension watches for file changes and automatically updates the function registry when files are created, modified, or deleted. This is implemented in `src/extension.ts` with a debounced update mechanism to avoid excessive processing.

## Data Flow

1. File watcher detects code changes
2. Parser extracts function metadata and AI tags
3. Storage layer updates the registry (JSON or SQLite)
4. AI tools can query the registry through the extension's API

## AI Integration

The extension provides several integration points for AI agents:

1. **Function Lookup**: AI agents can quickly look up function details without scanning the entire codebase
2. **Dependency Analysis**: AI agents can understand function dependencies for better refactoring suggestions
3. **Related Module Discovery**: AI agents can discover related modules for better context understanding
4. **Execution Token Filtering**: AI agents can filter functions by execution tokens for targeted operations

## Registry Formats

### JSON Registry Format

```json
{
  "functions": [
    {
      "filePath": "src/userService.ts",
      "functionName": "createUser",
      "dependsOn": ["validateUser", "dbInsert"],
      "related": ["UserModel"],
      "execTokens": ["test", "perf"]
    },
    // ... more functions
  ],
  "lastUpdated": "2023-07-21T15:32:41.123Z"
}
```

### SQLite Database Schema

```sql
-- Functions table
CREATE TABLE functions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filePath TEXT NOT NULL,
  functionName TEXT NOT NULL UNIQUE,
  lastUpdated TEXT NOT NULL
);

-- Dependencies table
CREATE TABLE dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  functionId INTEGER NOT NULL,
  dependsOn TEXT NOT NULL,
  FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE,
  UNIQUE(functionId, dependsOn)
);

-- Related modules table
CREATE TABLE related (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  functionId INTEGER NOT NULL,
  relatedTo TEXT NOT NULL,
  FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE,
  UNIQUE(functionId, relatedTo)
);

-- Execution tokens table
CREATE TABLE exec_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  functionId INTEGER NOT NULL,
  token TEXT NOT NULL,
  FOREIGN KEY (functionId) REFERENCES functions(id) ON DELETE CASCADE,
  UNIQUE(functionId, token)
);

-- Metadata table
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## Configuration Options

The extension can be configured through VS Code settings:

- `aiContextualLinking.watchFiles`: Enable/disable automatic file watching
- `aiContextualLinking.filePatterns`: File patterns to include in scanning
- `aiContextualLinking.storageType`: Storage type for the function registry (json or sqlite)

## Future Enhancements

1. **SQLite Storage**: Implement a SQLite-based storage layer for better performance with large codebases
2. **AST-based Parsing**: Use an AST parser for more accurate function detection
3. **Enhanced AI Integration**: Provide direct API access for AI tools to query the function registry
4. **Visualization**: Add a visualization tool to display function dependencies as a graph 