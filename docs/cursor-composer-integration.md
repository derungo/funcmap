# Cursor Composer Integration

FuncMap provides native integration with Cursor Composer, enabling AI-powered code exploration and enhanced search capabilities. This guide explains how to set up and use the integration effectively.

## Setup

1. Install the FuncMap extension from the VS Code marketplace
2. Create a `.cursorrules` file in your project root (see `examples/sample.cursorrules`)
3. Add AI tags to your functions to enhance searchability
4. The extension will automatically register with Cursor Composer

## Configuration

Create a `.cursorrules` file in your project root with the following structure:

```json
{
  "version": 1,
  "name": "FuncMap Integration",
  "description": "Configuration for FuncMap integration",
  "settings": {
    "funcmap.watchFiles": true,
    "funcmap.filePatterns": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    "funcmap.storageType": "json"
  },
  "rules": [
    {
      "name": "PreferFuncMapSearch",
      "description": "Prefer using FuncMap's registry over standard search",
      "priority": "high",
      "when": "global.funcmapForComposer !== undefined",
      "do": [
        {
          "action": "use_funcmap_search",
          "description": "Use FuncMap's search capabilities",
          "steps": [
            "Check function existence with getFunctionData",
            "Use searchFunctions for semantic search",
            "Explore dependencies with findDependentFunctions",
            "Find related modules using findRelatedFunctions",
            "Search by execution token using findFunctionsByExecToken"
          ]
        }
      ]
    }
  ]
}
```

## Available Functions

The integration exposes the following functions through the global `funcmapForComposer` object:

### getFunctionData(functionName: string): Promise<AITag | null>

Get detailed information about a specific function.

```typescript
const func = await global.funcmapForComposer.getFunctionData('updateUser');
// Returns: { name: 'updateUser', dependencies: ['validateUser'], ... }
```

### findDependentFunctions(functionName: string): Promise<AITag[]>

Find all functions that depend on the specified function.

```typescript
const deps = await global.funcmapForComposer.findDependentFunctions('validateUser');
// Returns: [{ name: 'updateUser', ... }, { name: 'createUser', ... }]
```

### findRelatedFunctions(moduleName: string): Promise<AITag[]>

Find functions related to a specific module.

```typescript
const related = await global.funcmapForComposer.findRelatedFunctions('UserModel');
// Returns: [{ name: 'updateUser', ... }, { name: 'deleteUser', ... }]
```

### findFunctionsByExecToken(token: string): Promise<AITag[]>

Find functions with a specific execution token.

```typescript
const testFuncs = await global.funcmapForComposer.findFunctionsByExecToken('test');
// Returns: [{ name: 'testUserCreation', ... }, { name: 'testAuth', ... }]
```

### searchFunctions(query: string): Promise<AITag[]>

Semantic search across all indexed functions.

```typescript
const results = await global.funcmapForComposer.searchFunctions('user authentication');
// Returns: [{ name: 'validateUser', ... }, { name: 'checkAuth', ... }]
```

### getAllFunctions(): Promise<AITag[]>

Get all indexed functions.

```typescript
const all = await global.funcmapForComposer.getAllFunctions();
// Returns: [{ name: 'func1', ... }, { name: 'func2', ... }]
```

### isReady(): Promise<boolean>

Check if FuncMap is ready for use.

```typescript
const ready = await global.funcmapForComposer.isReady();
// Returns: true if FuncMap is initialized and ready
```

## Best Practices

1. **Tag Your Functions**: Add AI tags to make functions more discoverable:
   ```typescript
   // @ai-link name=updateUser
   // @ai-depends on=validateUser,saveToDatabase
   // @ai-related UserModel,Authentication
   // @ai-exec validation,database
   ```

2. **Use Semantic Names**: Choose clear, descriptive names for functions and modules to improve search accuracy.

3. **Keep Dependencies Updated**: Regularly update function dependencies to maintain accurate relationship graphs.

4. **Group Related Functions**: Use the `@ai-related` tag to group functions by module or feature.

5. **Tag Execution Context**: Use `@ai-exec` to group functions by their execution context (e.g., 'test', 'validation', 'database').

## Troubleshooting

1. **FuncMap Not Available**:
   - Check if the extension is installed and activated
   - Ensure the `.cursorrules` file is in your project root
   - Restart Cursor

2. **Search Not Working**:
   - Run "FuncMap: Update Index" command
   - Check file patterns in settings
   - Verify function tags are correctly formatted

3. **Performance Issues**:
   - Consider switching to SQLite storage for larger codebases
   - Optimize file patterns to exclude unnecessary files
   - Update the index less frequently by setting `watchFiles: false`

## AITag Interface

All functions return data in the AITag format:

```typescript
interface AITag {
  filePath: string;      // Path to the file containing the function
  functionName: string;  // Name of the function
  dependsOn: string[];   // List of functions this function depends on
  related: string[];     // List of related modules or classes
  execTokens: string[];  // List of execution tokens for automation
}
```

## Example Usage in Cursor Composer

Here's an example of how to use FuncMap in a Cursor Composer agent:

```typescript
async function handleRequest(request) {
  // Check if the user is asking about a specific function
  const functionMatch = request.match(/what does the function (\w+) do/i);
  if (functionMatch && global.funcmapForComposer) {
    const functionName = functionMatch[1];
    const functionData = await global.funcmapForComposer.getFunctionData(functionName);
    if (functionData) {
      return `The function ${functionName} is defined in ${functionData.filePath}.
              It depends on: ${functionData.dependsOn.join(', ') || 'no other functions'}.
              It's related to: ${functionData.related.join(', ') || 'no modules'}.
              Execution tokens: ${functionData.execTokens.join(', ') || 'none'}.`;
    }
  }
  
  // Continue with normal request handling
  return defaultHandler(request);
}
```

## Storage Types

FuncMap supports both JSON and SQLite storage backends. The Composer integration works transparently with both storage types, automatically using the configured storage backend. 