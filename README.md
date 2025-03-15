# FuncMap

AI-queryable function registry with Cursor Composer integration for enhanced development.

## Features

- 🔍 **Smart Function Search**: Semantic search across your codebase's functions
- 🤖 **AI Integration**: Native integration with Cursor Composer for intelligent code exploration
- 🔗 **Function Dependencies**: Track and query function relationships
- 📦 **Module Relationships**: Understand module connections
- 🏷️ **Execution Tags**: Group functions by execution context
- 🔄 **Live Updates**: Watch for file changes and update the registry automatically

## Installation

1. Install the extension from the VS Code marketplace
2. If using with Cursor Composer, create a `.cursorrules` file in your project root (see example below)
3. Add AI tags to your functions to enhance searchability

## AI Tags

```typescript
// @ai-link name=yourFunction
// @ai-depends on=otherFunction1,otherFunction2
// @ai-related YourModule
// @ai-exec yourTag
function yourFunction() {
    // Implementation
}
```

## Cursor Composer Integration

FuncMap provides native integration with Cursor Composer through the global `funcmapForComposer` object. This enables intelligent code exploration and enhanced search capabilities.

### Setup

1. Create a `.cursorrules` file in your project root (see `examples/sample.cursorrules`)
2. The extension will automatically register with Cursor Composer
3. The AI will prefer using FuncMap's registry over standard code search

### Available Functions

```typescript
// Get specific function data
const func = await global.funcmapForComposer.getFunctionData('functionName');

// Find dependent functions
const deps = await global.funcmapForComposer.findDependentFunctions('functionName');

// Find related functions
const related = await global.funcmapForComposer.findRelatedFunctions('moduleName');

// Search by execution token
const tagged = await global.funcmapForComposer.findFunctionsByExecToken('token');

// Semantic search
const results = await global.funcmapForComposer.searchFunctions('query');

// Get all functions
const all = await global.funcmapForComposer.getAllFunctions();

// Check if FuncMap is ready
const ready = await global.funcmapForComposer.isReady();
```

## Configuration

```json
{
  "funcmap.watchFiles": true,
  "funcmap.filePatterns": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
  "funcmap.storageType": "json"
}
```

See the [documentation](docs/cursor-composer-integration.md) for detailed information about the Cursor Composer integration.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 