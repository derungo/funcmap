# AI Contextual Linking & Execution System

## What is it?

This VS Code extension enhances AI-assisted development. It creates an AI-queryable function registry. The extension indexes function metadata and relationships. This allows AI tools to understand code context quickly. It avoids full codebase scans for dependency analysis and code understanding.

## Quick Start

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/derungo/funcmap.git
   cd funcmap
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open the project in VS Code.
4. Press F5 to launch the extension in a development host.

### Basic Usage

1. **Tag functions** in your code with AI-specific comments:

   ```typescript
   // @ai-link name=fetchUserData
   // @ai-depends on=validateInput,parseResponse
   // @ai-related UserModel
   // @ai-exec test,benchmark
   async function fetchUserData(userId) {
     // Function implementation
   }
   ```

2. **Update the AI index**:
   - **Automatically**: The extension watches for file changes.
   - **Manually**: Open the Command Palette (Ctrl+Shift+P) and run "AI Contextual Linking: Update Index".

## Configuration

Extension settings are available in VS Code settings.

*   **`aiContextualLinking.watchFiles`**: Enable or disable automatic file watching for index updates. Defaults to `true`.
*   **`aiContextualLinking.filePatterns`**:  Define file patterns to include in the index scan. Defaults to `["**\/*.js", "**\/*.ts", "**\/*.jsx", "**\/*.tsx"]`.

## Public Features and API

### Commands

*   **`AI Contextual Linking: Update Index`**:  This command manually triggers the update of the AI function registry. It scans the workspace files based on configured patterns. It parses AI tags and saves the registry to `ai-links.json`.

### AI Tags

These tags are used in code comments to provide metadata:

*   **`@ai-link [name=functionName]`**:  Identifies a function to be included in the AI index. `name` attribute can specify an alternative function name in the registry.
*   **`@ai-depends on=function1,function2`**: Specifies function dependencies. Lists functions that the tagged function depends on.
*   **`@ai-related module1,module2`**: Links related modules or classes. Lists modules or classes related to the tagged function.
*   **`@ai-exec token1,token2`**: Defines execution tokens for automation. Lists tokens that can trigger specific actions (e.g., `test`, `benchmark`).

### `AITag` Interface

```typescript
interface AITag {
  filePath: string;
  functionName: string;
  dependsOn: string[];
  related: string[];
  execTokens: string[];
}
```

This interface represents the structure of AI tags parsed from code. It includes:

*   `filePath`: Path to the file containing the function.
*   `functionName`: Name of the function.
*   `dependsOn`: Array of function names that this function depends on.
*   `related`: Array of related modules or class names.
*   `execTokens`: Array of execution tokens.

### Storage

The extension uses JSON files (`ai-links.json`) to store the function registry. The registry file is located at the workspace root.

## Dependencies and Requirements

*   VS Code version `^1.60.0` or compatible IDE like Cursor.
*   TypeScript.

## Advanced Usage Examples

### Cursor AI Integration

This extension is designed for use with AI tools like Cursor.

*   **Context-aware Autocompletion**: AI can use the registry to suggest code completions based on function dependencies.
*   **Intelligent Refactoring**: AI can understand function relationships for safer and smarter refactoring suggestions.
*   **Automated Testing**:  Use `@ai-exec test` to trigger tests only for functions and their dependencies.
*   **Dependency Analysis**: Query the `ai-links.json` file to understand project dependencies without scanning the entire codebase.

### Execution Tokens

`@ai-exec` tags enable automation. For example:

*   Tag a function with `@ai-exec test`. AI tools can then be instructed to "run tests" for this function, triggering specific test scripts.
*   Use `@ai-exec benchmark` to link functions to performance benchmarking tools.