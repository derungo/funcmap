# Usage Guide

## Tagging Your Code

### Basic Function Tagging

```typescript
// @ai-link name=functionName
function myFunction() {
  // Implementation
}
```

### Specifying Dependencies

```typescript
// @ai-depends on=otherFunction,helperUtil
function processingFunction() {
  // Implementation
}
```

### Linking Related Modules

```typescript
// @ai-related UserModel,AuthService
function getUserDetails() {
  // Implementation
}
```

### Adding Execution Tokens

```typescript
// @ai-exec test,benchmark,coverage
function criticalFunction() {
  // Implementation
}
```

## Working with the Extension

### Updating the Index

The extension automatically watches for file changes and updates the index. You can also manually trigger an update:

1. Open the Command Palette (Ctrl+Shift+P)
2. Type and select "AI Contextual Linking: Update Index"

### Viewing Function Relationships

After the index is built, the AI registry information is stored in an `ai-links.json` file at the root of your workspace. This file can be queried by AI tools like Cursor to understand function relationships without having to scan the entire codebase.

## Cursor AI Integration

When using Cursor IDE with this extension:

1. The AI can automatically find dependencies without scanning the full codebase
2. Ask questions like "What functions depend on validateUser?"
3. Request "Run tests for all functions that depend on the database layer"
4. Suggest refactoring with awareness of all dependencies

## Configuring the Extension

You can customize the extension behavior in VS Code settings:

- `aiContextualLinking.watchFiles`: Enable/disable automatic file watching
- `aiContextualLinking.filePatterns`: File patterns to include in scanning 