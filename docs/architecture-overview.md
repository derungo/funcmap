# Architecture Overview

## System Components

### 1. Parser System
The parser scans your codebase for AI-specific tags:
- `@ai-link`: Identifies a function to be indexed
- `@ai-depends`: Specifies dependencies on other functions
- `@ai-related`: Links to related modules or classes
- `@ai-exec`: Defines execution tokens for automation

### 2. Storage Layer
Currently, the extension uses JSON-based storage (`ai-links.json`). In future releases, SQLite support will be added for better performance with large codebases.

### 3. Extension Commands
- `aiContextualLinking.updateIndex`: Scans the codebase and updates the function registry

### 4. File Watchers
The extension watches for file changes and automatically updates the function registry when files are created, modified, or deleted.

## Data Flow

1. File watcher detects code changes
2. Parser extracts function metadata and AI tags
3. Storage layer updates the registry (JSON)
4. AI tools can query the registry when needed

## JSON Registry Format

The registry is stored in `ai-links.json` with the following structure:

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