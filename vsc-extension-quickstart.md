# AI Contextual Linking & Execution System - Quick Start Guide

## What is it?

This VS Code extension enhances AI-assisted development by creating an AI-queryable function registry. It indexes function metadata and relationships, allowing AI tools to understand code context quickly without scanning the entire codebase.

## Features

- Tag functions with `@ai-link`, `@ai-depends`, and `@ai-related` to map code relationships
- Use `@ai-exec` to trigger function-specific automation
- Choose between JSON or SQLite storage for the function registry
- Enhanced function detection for regular functions, arrow functions, async functions, and class methods

## Getting Started

### 1. Tag Your Functions

Add AI-specific comments to your functions:

```typescript
// @ai-link name=fetchUserData
// @ai-depends on=validateInput,parseResponse
// @ai-related UserModel
// @ai-exec test,benchmark
async function fetchUserData(userId) {
  // Function implementation
}
```

### 2. Update Your AI Index

- **Automatically**: The extension watches file changes
- **Manually**: Run the "AI Contextual Linking: Update Index" command (Ctrl+Shift+P)

### 3. Access Function Relationships

Use the extension's API to access function relationships:

```typescript
// Get data for a specific function
const functionData = await vscode.commands.executeCommand('aiContextualLinking.getFunctionData', 'fetchUserData');

// Find functions that depend on a specific function
const dependentFunctions = await vscode.commands.executeCommand('aiContextualLinking.findDependentFunctions', 'validateInput');

// Find functions related to a specific module
const relatedFunctions = await vscode.commands.executeCommand('aiContextualLinking.findRelatedFunctions', 'UserModel');

// Find functions with a specific execution token
const testFunctions = await vscode.commands.executeCommand('aiContextualLinking.findFunctionsByExecToken', 'test');
```

## Configuration

The extension can be configured through VS Code settings:

- `aiContextualLinking.watchFiles`: Enable/disable automatic file watching (default: `true`)
- `aiContextualLinking.filePatterns`: File patterns to include in scanning (default: `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]`)
- `aiContextualLinking.storageType`: Storage type for the function registry (default: `json`)

## Documentation

For more detailed information, please see:
- [Architecture Overview](./docs/architecture-overview.md)
- [Usage Guide](./docs/usage-guide.md)
- [Generated Documentation](./docs/generated-docs.md)

## Support

If you encounter any issues or have questions, please visit the [GitHub repository](https://github.com/derungo/funcmap). 