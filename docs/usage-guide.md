# Usage Guide

## Tagging Your Code

### Basic Function Tagging

```typescript
// @ai-link name=functionName
function myFunction() {
  // Implementation
}
```

The `@ai-link` tag identifies a function to be included in the AI index. The optional `name` attribute allows you to specify an alternative name for the function in the registry, which can be useful for functions with generated or complex names.

### Specifying Dependencies

```typescript
// @ai-depends on=otherFunction,helperUtil
function processingFunction() {
  // Implementation
}
```

The `@ai-depends` tag specifies functions that this function depends on. This helps AI tools understand the relationships between functions and can be used for dependency analysis, refactoring suggestions, and more.

### Linking Related Modules

```typescript
// @ai-related UserModel,AuthService
function getUserDetails() {
  // Implementation
}
```

The `@ai-related` tag links the function to related modules or classes. This provides additional context for AI tools about the broader architecture and can help with understanding the function's purpose and relationships.

### Adding Execution Tokens

```typescript
// @ai-exec test,benchmark,coverage
function criticalFunction() {
  // Implementation
}
```

The `@ai-exec` tag defines execution tokens that can be used for automation. For example, you can tag functions that should be included in specific test suites, performance benchmarks, or code coverage analysis.

## Working with the Extension

### Updating the Index

The extension automatically watches for file changes and updates the index. You can also manually trigger an update:

1. Open the Command Palette (Ctrl+Shift+P)
2. Type and select "AI Contextual Linking: Update Index"

### Storage Options

The extension supports two storage options:

1. **JSON Storage**: Simple file-based storage in `ai-links.json` (default)
2. **SQLite Storage**: Database-backed storage in `ai-links.db` for better performance with large codebases

You can configure the storage type in the extension settings:

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for "AI Contextual Linking"
3. Set "Storage Type" to either "json" or "sqlite"

### Querying the Function Registry

The extension provides several commands for querying the function registry:

- **Get Function Data**: Get data for a specific function
- **Find Dependent Functions**: Find functions that depend on a specific function
- **Find Related Functions**: Find functions related to a specific module
- **Find Functions By Execution Token**: Find functions with a specific execution token

These commands can be accessed programmatically through the extension's API:

```typescript
// Get data for a specific function
const functionData = await vscode.commands.executeCommand('aiContextualLinking.getFunctionData', 'functionName');

// Find functions that depend on a specific function
const dependentFunctions = await vscode.commands.executeCommand('aiContextualLinking.findDependentFunctions', 'functionName');

// Find functions related to a specific module
const relatedFunctions = await vscode.commands.executeCommand('aiContextualLinking.findRelatedFunctions', 'moduleName');

// Find functions with a specific execution token
const functionsWithToken = await vscode.commands.executeCommand('aiContextualLinking.findFunctionsByExecToken', 'tokenName');
```

## AI Agent Integration

### Function Lookup

AI agents can quickly look up function details without scanning the entire codebase:

```typescript
// Example AI agent query
const functionData = await vscode.commands.executeCommand('aiContextualLinking.getFunctionData', 'authenticateUser');
console.log(`Function ${functionData.functionName} is defined in ${functionData.filePath}`);
console.log(`Dependencies: ${functionData.dependsOn.join(', ')}`);
console.log(`Related modules: ${functionData.related.join(', ')}`);
console.log(`Execution tokens: ${functionData.execTokens.join(', ')}`);
```

### Dependency Analysis

AI agents can understand function dependencies for better refactoring suggestions:

```typescript
// Example AI agent refactoring analysis
const dependentFunctions = await vscode.commands.executeCommand('aiContextualLinking.findDependentFunctions', 'validateInput');
console.log(`${dependentFunctions.length} functions depend on validateInput`);
console.log('These functions may need to be updated if validateInput changes:');
dependentFunctions.forEach(func => console.log(`- ${func.functionName} in ${func.filePath}`));
```

### Related Module Discovery

AI agents can discover related modules for better context understanding:

```typescript
// Example AI agent context discovery
const relatedFunctions = await vscode.commands.executeCommand('aiContextualLinking.findRelatedFunctions', 'UserModel');
console.log(`${relatedFunctions.length} functions are related to UserModel`);
relatedFunctions.forEach(func => console.log(`- ${func.functionName} in ${func.filePath}`));
```

### Execution Token Filtering

AI agents can filter functions by execution tokens for targeted operations:

```typescript
// Example AI agent test generation
const testFunctions = await vscode.commands.executeCommand('aiContextualLinking.findFunctionsByExecToken', 'test');
console.log(`${testFunctions.length} functions are marked for testing`);
testFunctions.forEach(func => {
  console.log(`Generating test for ${func.functionName}...`);
  // Generate test code based on function details
});
```

## Cursor AI Integration

When using Cursor IDE with this extension:

1. The AI can automatically find dependencies without scanning the full codebase
2. Ask questions like "What functions depend on validateUser?"
3. Request "Run tests for all functions that depend on the database layer"
4. Suggest refactoring with awareness of all dependencies

### Example Cursor Prompts

- "Show me all functions that depend on the `authenticateUser` function"
- "What modules are related to the `UserService`?"
- "Generate tests for functions with the `@ai-exec test` tag"
- "Refactor the `processPayment` function and update all dependent functions"
- "Explain the dependency chain for the `submitOrder` function"

## Configuring the Extension

You can customize the extension behavior in VS Code settings:

- `aiContextualLinking.watchFiles`: Enable/disable automatic file watching (default: `true`)
- `aiContextualLinking.filePatterns`: File patterns to include in scanning (default: `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]`)
- `aiContextualLinking.storageType`: Storage type for the function registry (default: `json`)

To access these settings:

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for "AI Contextual Linking"
3. Adjust the settings as needed

## Best Practices

1. **Be Specific with Dependencies**: Only list direct dependencies in `@ai-depends` to keep the dependency graph clean
2. **Use Consistent Names**: Use the same function names across your codebase for better AI understanding
3. **Update Regularly**: Run the update index command after significant code changes
4. **Document Complex Relationships**: Use `@ai-related` to document non-direct dependencies or conceptual relationships
5. **Leverage Execution Tokens**: Use `@ai-exec` tags to enable automated workflows and testing
6. **Choose the Right Storage**: Use JSON for small projects and SQLite for large codebases 