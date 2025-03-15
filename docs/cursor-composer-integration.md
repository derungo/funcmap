# FuncMap Cursor Composer Integration

FuncMap now provides native integration with Cursor Composer, allowing AI agents to directly query the function relationship database instead of performing brute force code searches.

## Available Functions

The following functions are available through the global `funcmapForComposer` object:

### getFunctionData(functionName: string): Promise<AITag | null>
Retrieves detailed information about a specific function, including:
- File path
- Function name
- Dependencies
- Related modules
- Execution tokens

```typescript
const functionData = await global.funcmapForComposer.getFunctionData('updateIndex');
console.log(`Function found in ${functionData.filePath}`);
console.log(`Dependencies: ${functionData.dependsOn.join(', ')}`);
```

### findDependentFunctions(functionName: string): Promise<AITag[]>
Finds all functions that depend on the specified function.

```typescript
const dependents = await global.funcmapForComposer.findDependentFunctions('validateUser');
console.log(`Found ${dependents.length} functions that depend on validateUser`);
```

### findRelatedFunctions(moduleName: string): Promise<AITag[]>
Finds all functions related to a specific module or class.

```typescript
const related = await global.funcmapForComposer.findRelatedFunctions('UserModel');
console.log(`Found ${related.length} functions related to UserModel`);
```

### findFunctionsByExecToken(token: string): Promise<AITag[]>
Finds all functions tagged with a specific execution token.

```typescript
const testFunctions = await global.funcmapForComposer.findFunctionsByExecToken('test');
console.log(`Found ${testFunctions.length} functions tagged for testing`);
```

### searchFunctions(query: string): Promise<AITag[]>
Performs a text search across all indexed functions.

```typescript
const searchResults = await global.funcmapForComposer.searchFunctions('user');
console.log(`Found ${searchResults.length} functions matching 'user'`);
```

### getAllFunctions(): Promise<AITag[]>
Retrieves all indexed functions.

```typescript
const allFunctions = await global.funcmapForComposer.getAllFunctions();
console.log(`Total indexed functions: ${allFunctions.length}`);
```

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