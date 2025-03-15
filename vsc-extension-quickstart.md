# AI Contextual Linking & Execution System - Extension Quick Start

## What's in the folder

* This folder contains all of the files necessary for the AI Contextual Linking & Execution System extension.
* `package.json` - this is the manifest file that defines the extension's metadata and activation events.
* `src/extension.ts` - this is the main file where the extension code is registered.
* The `src` folder contains all the TypeScript source code for the extension.

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* Run the command "AI Contextual Linking: Update Index" from the Command Palette (Ctrl+Shift+P).
* Add AI tags to your functions (see below for examples).
* Use the extension commands to query the function registry.

## AI Tags Examples

```typescript
// @ai-link name=fetchUserData
// @ai-depends on=validateInput,parseResponse
// @ai-related UserModel
// @ai-exec test,benchmark
async function fetchUserData(userId) {
  // Function implementation
}
```

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Explore the API

* You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`.

## Building and Packaging

* To build the extension, run `npm run compile`.
* To package the extension into a VSIX file, run `npm run package`.
* To install the packaged extension, use the "Extensions: Install from VSIX..." command in VS Code.

## Extension Settings

This extension contributes the following settings:

* `aiContextualLinking.watchFiles`: Enable or disable automatic file watching for index updates. Defaults to `true`.
* `aiContextualLinking.filePatterns`: Define file patterns to include in the index scan. Defaults to `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]`.
* `aiContextualLinking.storageType`: Storage type for the function registry (json or sqlite). Defaults to `json`.

## Extension Commands

* `AI Contextual Linking: Update Index`: Manually triggers the update of the AI function registry.
* `AI Contextual Linking: Get Function Data`: Gets data for a specific function.
* `AI Contextual Linking: Find Dependent Functions`: Finds functions that depend on a specific function.
* `AI Contextual Linking: Find Related Functions`: Finds functions related to a specific module.
* `AI Contextual Linking: Find Functions By Execution Token`: Finds functions with a specific execution token.

## For more information

* [Visual Studio Code's Extension API](https://code.visualstudio.com/api)
* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) 