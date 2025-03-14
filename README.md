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

- **SQLite-Based AI Function Registry (Coming Soon)**
  - Ultra-fast querying with SQLite-backed function index
  - 10x faster function recall and debugging

## 🚀 Getting Started

### Installation

```bash
git clone https://github.com/YourUsername/ai-contextual-linking.git
cd ai-contextual-linking
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

3. Access function relationships through the AI or the extension's API

## 📚 Documentation

- [Architecture Overview](./docs/architecture-overview.md)
- [Usage Guide](./docs/usage-guide.md)

## 🛠️ Development

### Project Structure

```
ai-contextual-linking/
├── src/
│   ├── extension.ts         # Main extension entry point
│   ├── parser/              # Code parsing functionality
│   ├── storage/             # Data storage (JSON/SQLite)
│   ├── commands/            # VS Code commands
│   └── utils/               # Utility functions
├── docs/                    # Documentation
└── ...
```

### Building the Extension

```bash
npm run compile
```

### Running Tests

```bash
npm test
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 