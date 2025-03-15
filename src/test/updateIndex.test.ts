import * as assert from 'assert';
import * as vscode from 'vscode';
import { updateIndex } from '../commands/updateIndex';
import { AITag } from '../parser/aiTagParser';

// Mock Memento with setKeysForSync method
const mockMemento: vscode.Memento & { setKeysForSync: (keys: readonly string[]) => void } = {
  get: <T>(key: string, defaultValue?: T) => defaultValue,
  update: async (key: string, value: any) => {},
  setKeysForSync: (keys: readonly string[]) => {},
  keys: () => []
};

// Mock EnvironmentVariableCollection with getScoped method
const mockEnvironmentVariableCollection: vscode.EnvironmentVariableCollection & { getScoped: (scope: vscode.EnvironmentVariableScope) => vscode.EnvironmentVariableCollection } = {
  replace: (variable: string, value: string) => {},
  append: (variable: string, value: string) => {},
  prepend: (variable: string, value: string) => {},
  get: (variable: string) => undefined,
  delete: (variable: string) => {},
  clear: () => {},
  forEach: (callback: (variable: string, mutator: vscode.EnvironmentVariableMutator, collection: vscode.EnvironmentVariableCollection) => any, thisArg?: any) => {},
  persistent: true,
  getScoped: (scope: vscode.EnvironmentVariableScope) => mockEnvironmentVariableCollection,
  description: 'Mock Environment Variable Collection',
  [Symbol.iterator]: function* () {}
};

// Mock ExtensionContext for testing
const mockContext: vscode.ExtensionContext = {
  subscriptions: [],
  workspaceState: mockMemento,
  globalState: mockMemento,
  secrets: {} as vscode.SecretStorage,
  extensionUri: vscode.Uri.parse(''),
  environmentVariableCollection: mockEnvironmentVariableCollection,
  storageUri: undefined,
  globalStorageUri: vscode.Uri.parse(''),
  logUri: vscode.Uri.parse(''),
  extensionMode: vscode.ExtensionMode.Test,
  extensionPath: '',
  asAbsolutePath: (relativePath: string) => '',
  storagePath: undefined,
  globalStoragePath: '',
  logPath: '',
  extension: {} as vscode.Extension<any>,
  languageModelAccessInformation: {} as any
};

suite('Update Index Command Tests', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Update Index Command should update the function registry', async () => {
    await updateIndex(mockContext);

    // Load the function registry
    const registry = await vscode.commands.executeCommand<AITag[]>('aiContextualLinking.getFunctionData', 'fetchUserData');

    // Check if the registry contains the expected function
    assert.ok(registry, 'Function registry should be updated');
    assert.ok(registry.some(tag => tag.functionName === 'fetchUserData'), 'Registry should contain fetchUserData function');
  });
}); 