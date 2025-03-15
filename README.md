# AI Contextual Linking & Execution System

A VS Code/Cursor extension that creates a pre-indexed, AI-queryable function registry to enhance AI-assisted development.

## 🎯 Key Features

- **AI Contextual Linking & Pre-Indexed Function Map**
  - Tag functions with `@ai-link`, `@ai-depends`, and `@ai-related`
  - Generates structured metadata to map function dependencies
  - Reduces AI search time by avoiding full codebase scans

- **AI Execution Tokens for Smarter CI/CD & Debugging**
  - Use `@ai-exec` to trigger function-specific automation
  - Context-aware AI debugging with automatic dependency linking

- **Dual Storage Options**
  - JSON storage for simple projects
  - SQLite-based AI function registry for large codebases
  - Ultra-fast querying with SQLite-backed function index

- **Enhanced Function Detection**
  - Detects regular functions, arrow functions, and async functions
  - Supports class methods with proper class context

## 🚀 Getting Started

### Installation

#### From VSIX File
Download the [latest release](https://github.com/derungo/funcmap/releases) and install it in VS Code:
1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X)
3. Click "..." menu in the top-right corner
4. Select "Install from VSIX..."
5. Navigate to and select the downloaded VSIX file

Alternatively, install from command line:
```bash
code --install-extension funcmap-0.1.0.vsix
```

#### From Source
```bash
git clone https://github.com/derungo/funcmap.git
cd funcmap
npm install
```

### Running the Extension

Press F5 in VS Code to launch the extension in a development host window.

### Basic Usage

1. Tag your functions with AI-specific comments:

```typescript
// @ai-link name=fetchUserData
// @ai-depends on=validateInput,parseResponse
// @ai-related UserModel
// @ai-exec test,benchmark
async function fetchUserData(userId) {
  // Function implementation
}
```

2. Update your AI index:
   - Automatically: The extension watches file changes
   - Manually: Run the "AI Contextual Linking: Update Index" command (Ctrl+Shift+P)

3. Access function relationships through the extension's API:

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

## 📚 Documentation

- [Architecture Overview](./docs/architecture-overview.md)
- [Usage Guide](./docs/usage-guide.md)
- [Generated Documentation](./docs/generated-docs.md)

## 🧩 AI Tag Reference

### @ai-link
Identifies a function to be included in the AI index.

```typescript
// @ai-link name=alternativeName
function myFunction() { /* ... */ }
```

The optional `name` parameter allows you to specify an alternative name for the function in the registry.

### @ai-depends
Specifies functions that this function depends on.

```typescript
// @ai-depends on=otherFunction,helperUtil
function processingFunction() { /* ... */ }
```

### @ai-related
Links the function to related modules or classes.

```typescript
// @ai-related UserModel,AuthService
function getUserDetails() { /* ... */ }
```

### @ai-exec
Defines execution tokens for automation.

```typescript
// @ai-exec test,benchmark,coverage
function criticalFunction() { /* ... */ }
```

## 🌐 Language Support

The current implementation primarily targets JavaScript and TypeScript code. The parser is optimized for detecting functions and methods in these languages.

Future versions will add support for additional programming languages through a plugin system for language-specific parsers, including:
- Python
- Java
- C#
- Ruby
- Go

## ⚙️ Configuration

The extension can be configured through VS Code settings:

- `aiContextualLinking.watchFiles`: Enable/disable automatic file watching (default: `true`)
- `aiContextualLinking.filePatterns`: File patterns to include in scanning (default: `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]`)
- `aiContextualLinking.storageType`: Storage type for the function registry (default: `json`)

## 🛠️ Development

### Project Structure

```
funcmap/
├── src/
│   ├── extension.ts         # Main extension entry point
│   ├── parser/              # Code parsing functionality
│   │   └── aiTagParser.ts   # Parses AI tags from code
│   ├── storage/             # Data storage (JSON/SQLite)
│   │   ├── jsonStorage.ts   # JSON storage implementation
│   │   └── sqliteStorage.ts # SQLite storage implementation
│   ├── commands/            # VS Code commands
│   │   └── updateIndex.ts   # Update index command
│   └── utils/               # Utility functions
│       ├── logger.ts        # Logging utility
│       └── config.ts        # Configuration utility
├── docs/                    # Documentation
│   ├── architecture-overview.md
│   ├── usage-guide.md
│   └── generated-docs.md
└── ...
```

### Future Development Plans

1. **Improved Parser Robustness**: 
   - Use TypeScript's compiler API for more accurate parsing
   - Better handling of complex code patterns and edge cases

2. **Performance Optimization**:
   - Implement incremental updates rather than full rescans
   - Persistent caching of parsed results to speed up initial loading

3. **Language Agnosticism**:
   - Develop a plugin system for language-specific parsers
   - Support for Python, Java, C#, and other popular languages

4. **Enhanced AI Integration**:
   - Develop specialized AI prompts and commands that leverage the registry
   - Create AI-specific APIs for common code understanding tasks

### Building the Extension

```bash
npm run compile
```

### Packaging the Extension

```bash
npm run package
```

### Running Tests

```bash
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. 