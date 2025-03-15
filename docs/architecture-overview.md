# Architecture Overview

## System Components

### 1. Parser System
The parser scans your codebase for AI-specific tags:
- `@ai-link`: Identifies a function to be indexed (can specify an alternative name with `name=functionName`)
- `@ai-depends`: Specifies dependencies on other functions (format: `on=function1,function2`)
- `@ai-related`: Links to related modules or classes (format: `Module1,Class2`)
- `@ai-exec`: Defines execution tokens for automation (format: `test,benchmark,coverage`)

### 2. Input Sanitization
The tag sanitizer ensures security and data integrity:
- Function name validation using safe identifier patterns
- File path sanitization with directory traversal prevention
- Tag value validation for dependencies and related modules
- Execution token validation against allowed tokens
- Custom error handling for invalid inputs

### 3. Storage Layer
The extension supports two storage options:

#### JSON Storage
- Simple file-based storage in `ai-links.json`
- Good for small to medium-sized projects
- Fast for projects under 1000 functions
- Implemented in `src/storage/jsonStorage.ts`

#### SQLite Storage
- Database-backed storage in `ai-links.db`
- Better performance for large codebases (>1000 functions)
- Optimized query performance for dependency analysis
- Transaction support for data integrity
- Implemented in `src/storage/sqliteStorage.ts`

### 4. Progress Reporting
Granular progress tracking during operations:
- Detailed progress steps with percentage indicators
- User-friendly progress messages
- Cancellation support with cleanup
- Error handling with descriptive messages

### 5. Rate Limiting
File watching optimization:
- Debounced updates to prevent excessive processing
- Configurable debounce time (default: 1 second)
- TypeScript type safety for debounced functions
- Memory leak prevention in watchers

### 6. Performance Benchmarking
Comprehensive testing suite:
- Benchmarks for different storage backends
- Sample size testing (10 to 5000 functions)
- Measures:
  - Indexing time
  - Query performance
  - Storage size
  - Concurrent operation handling

## Data Flow

1. File watcher detects code changes (rate-limited)
2. Input sanitizer validates function and tag data
3. Parser extracts function metadata and AI tags
4. Progress reporting tracks operation status
5. Storage layer updates the registry (JSON or SQLite)
6. Performance metrics are collected (in test mode)

## Security Considerations

1. **Input Validation**
   - Function names must match safe identifier patterns
   - File paths are sanitized to prevent traversal
   - Tag values are validated against allowed patterns
   - Execution tokens are checked against whitelist

2. **Data Integrity**
   - SQLite transactions for atomic updates
   - File watching debouncing prevents corruption
   - Error handling with proper cleanup
   - Concurrent operation safety

3. **Resource Management**
   - Memory leak prevention in watchers
   - Rate limiting for file system operations
   - Proper cleanup of system resources
   - Cancellation handling for long operations

## Performance Optimization

1. **Storage Selection**
   - JSON storage for small projects (<1000 functions)
   - SQLite for large projects (>1000 functions)
   - Automatic performance benchmarking
   - Storage size optimization

2. **Operation Efficiency**
   - Debounced file watching
   - Incremental updates
   - Optimized query patterns
   - Resource cleanup

## Future Improvements

1. **Enhanced Language Support**
   - Plugin system for language-specific parsers
   - Support for additional comment styles
   - Language-agnostic tag format

2. **Performance Enhancements**
   - Incremental parsing optimization
   - Caching improvements
   - Query optimization

3. **Security Enhancements**
   - Additional input validation
   - Sandboxed execution
   - Enhanced error handling

4. **UI Improvements**
   - Visual progress indicators
   - Interactive cancellation
   - Performance monitoring dashboard

## Extension Commands

- `aiContextualLinking.updateIndex`: Scans the codebase and updates the function registry
- `aiContextualLinking.getFunctionData`: Gets data for a specific function
- `aiContextualLinking.findDependentFunctions`: Finds functions that depend on a specific function
- `aiContextualLinking.findRelatedFunctions`: Finds functions related to a specific module
- `aiContextualLinking.findFunctionsByExecToken`: Finds functions with a specific execution token

## File Watchers

The extension watches for file changes and automatically updates the function registry when files are created, modified, or deleted. This is implemented in `src/extension.ts` with a debounced update mechanism to avoid excessive processing.

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

1. **Improved Parser Robustness**: 
   - Use TypeScript's compiler API for more accurate parsing
   - Support for additional programming languages through language-agnostic parsing strategies
   - Better handling of complex code patterns and edge cases

2. **Performance Optimization**:
   - Implement incremental updates rather than full rescans
   - Persistent caching of parsed results to speed up initial loading
   - Optimize database queries for large codebases

3. **Enhanced AI Integration**:
   - Develop specialized AI prompts and commands that leverage the registry
   - Create AI-specific APIs for common code understanding tasks
   - Provide context-aware code completion suggestions

4. **Language Agnosticism**:
   - Develop a plugin system for language-specific parsers
   - Support for Python, Java, C#, and other popular languages
   - Language-agnostic tag format that works across different comment styles 