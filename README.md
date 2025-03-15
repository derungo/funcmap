# FuncMap

FuncMap is a VS Code extension that creates an AI-queryable function registry for your codebase. It helps you understand function relationships, dependencies, and execution patterns.

## Features

- Creates a pre-indexed, AI-queryable function registry
- Allows tagging functions with metadata like dependencies, related modules, and execution tokens
- Provides storage options in both JSON and SQLite
- Offers query functionality through VS Code commands
- Native integration with Cursor Composer for AI-powered code exploration

## Installation

1. Install the extension from the VS Code marketplace
2. Open your workspace
3. The extension will automatically start indexing your JavaScript/TypeScript files

## Usage

### Function Tags

Add AI-friendly tags to your functions to enhance discoverability:

```typescript
// @ai-link name=updateUser
// @ai-depends on=validateUser,saveToDatabase
// @ai-related UserModel,Authentication
// @ai-exec validation,database
async function updateUser(userId: string, data: UserData) {
  // Implementation
}
```

### Available Tags

- `@ai-link name={name}` - Links a function to the AI index with optional alternative name
- `@ai-depends on={dependencies}` - Specifies functions that this function depends on (comma-separated)
- `@ai-related {modules}` - Links the function to related modules or classes (comma-separated)
- `@ai-exec {tokens}` - Defines execution tokens for automation (comma-separated)

### VS Code Commands

- `FuncMap: Update Index` - Manually update the function registry
- `FuncMap: Get Function Data` - Get details about a specific function
- `FuncMap: Find Dependent Functions` - Find functions that depend on a specific function
- `FuncMap: Find Related Functions` - Find functions related to a specific module
- `FuncMap: Find Functions By Execution Token` - Find functions with a specific execution token

### Cursor Composer Integration

FuncMap now provides native integration with Cursor Composer, allowing AI agents to directly query the function relationship database. This enables more efficient and accurate code exploration and understanding.

To use FuncMap with Cursor Composer, the extension exposes a global `funcmapForComposer` object with the following functions:

```typescript
// Get details about a specific function
const functionData = await global.funcmapForComposer.getFunctionData('updateUser');

// Find functions that depend on a specific function
const dependents = await global.funcmapForComposer.findDependentFunctions('validateUser');

// Find functions related to a module
const related = await global.funcmapForComposer.findRelatedFunctions('UserModel');

// Find functions with a specific execution token
const testFunctions = await global.funcmapForComposer.findFunctionsByExecToken('test');

// Search across all indexed functions
const searchResults = await global.funcmapForComposer.searchFunctions('user');

// Get all indexed functions
const allFunctions = await global.funcmapForComposer.getAllFunctions();
```

For detailed information about the Cursor Composer integration, see [Cursor Composer Integration](docs/cursor-composer-integration.md).

## Configuration

```json
{
  "funcmap.watchFiles": true,
  "funcmap.filePatterns": [
    "**/*.js",
    "**/*.ts",
    "**/*.jsx",
    "**/*.tsx"
  ],
  "funcmap.storageType": "json"
}
```

- `funcmap.watchFiles` - Enable/disable automatic file watching for index updates
- `funcmap.filePatterns` - File patterns to include in the index scan
- `funcmap.storageType` - Storage type for the function registry (`json` or `sqlite`)

## Storage Types

FuncMap supports two storage backends:

- **JSON Storage**: Simple file-based storage, suitable for smaller codebases
- **SQLite Storage**: More robust storage with better query performance, recommended for larger codebases

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 