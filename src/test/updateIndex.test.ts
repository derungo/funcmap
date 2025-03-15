import * as assert from 'assert';
import * as vscode from 'vscode';
import { updateIndex } from '../commands/updateIndex';
import { AITag } from '../parser/aiTagParser';
import * as fs from 'fs';
import * as path from 'path';

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
export const mockContext: vscode.ExtensionContext = {
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
  const testWorkspacePath = path.join(__dirname, '../../../test-workspace');
  
  suiteSetup(async () => {
    // Create test workspace if it doesn't exist
    if (!fs.existsSync(testWorkspacePath)) {
      fs.mkdirSync(testWorkspacePath, { recursive: true });
    }
  });
  
  setup(async () => {
    // Clean up any existing registry files before each test
    const jsonPath = path.join(testWorkspacePath, 'funcmap.json');
    const sqlitePath = path.join(testWorkspacePath, 'funcmap.db');
    
    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
    if (fs.existsSync(sqlitePath)) fs.unlinkSync(sqlitePath);
  });
  
  test('Update Index Command should create registry with valid functions', async () => {
    // Create a test file with valid function tags
    const testFilePath = path.join(testWorkspacePath, 'valid.ts');
    const testContent = `
      // @ai-link name=testFunction
      // @ai-depends on=helperFunction
      // @ai-related TestModule
      // @ai-exec test,benchmark
      function testFunction() {
        // Implementation
      }
    `;
    fs.writeFileSync(testFilePath, testContent);
    
    await updateIndex(mockContext);
    
    const registry = await vscode.commands.executeCommand<AITag[]>('funcmap.getFunctionData', 'testFunction');
    
    assert.ok(registry, 'Registry should be created');
    assert.ok(registry.some(tag => tag.functionName === 'testFunction'), 'Registry should contain test function');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  });
  
  test('Update Index Command should handle empty workspace', async () => {
    await updateIndex(mockContext);
    
    const registry = await vscode.commands.executeCommand<AITag[]>('funcmap.getFunctionData', 'nonexistent');
    assert.ok(registry !== null, 'Registry should be created even when empty');
    assert.strictEqual(registry.length, 0, 'Registry should be empty');
  });
  
  test('Update Index Command should handle malformed tags', async () => {
    // Create a test file with malformed tags
    const testFilePath = path.join(testWorkspacePath, 'malformed.ts');
    const testContent = `
      // @ai-link
      // @ai-depends
      // @ai-related
      // @ai-exec
      function malformedFunction() {
        // Implementation
      }
    `;
    fs.writeFileSync(testFilePath, testContent);
    
    await updateIndex(mockContext);
    
    const registry = await vscode.commands.executeCommand<AITag[]>('funcmap.getFunctionData', 'malformedFunction');
    assert.ok(registry, 'Registry should be created despite malformed tags');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  });
  
  test('Update Index Command should handle large files', async () => {
    // Create a large test file
    const testFilePath = path.join(testWorkspacePath, 'large.ts');
    let testContent = '';
    
    // Generate 1000 functions with tags
    for (let i = 0; i < 1000; i++) {
      testContent += `
        // @ai-link name=function${i}
        // @ai-depends on=helper${i}
        // @ai-related Module${i}
        // @ai-exec test
        function function${i}() {
          // Implementation
        }
      `;
    }
    
    fs.writeFileSync(testFilePath, testContent);
    
    await updateIndex(mockContext);
    
    const registry = await vscode.commands.executeCommand<AITag[]>('funcmap.getFunctionData', 'function0');
    assert.ok(registry, 'Registry should handle large files');
    assert.ok(registry.some(tag => tag.functionName === 'function0'), 'Registry should contain functions from large file');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  });
  
  test('Update Index Command should handle concurrent updates', async () => {
    // Create multiple test files
    const files = ['test1.ts', 'test2.ts', 'test3.ts'].map(filename => 
      path.join(testWorkspacePath, filename)
    );
    
    files.forEach((file, index) => {
      const content = `
        // @ai-link name=function${index}
        function function${index}() {}
      `;
      fs.writeFileSync(file, content);
    });
    
    // Trigger multiple concurrent updates
    await Promise.all([
      updateIndex(mockContext),
      updateIndex(mockContext),
      updateIndex(mockContext)
    ]);
    
    // Verify registry integrity
    const registry = await vscode.commands.executeCommand<AITag[]>('funcmap.getFunctionData', 'function0');
    assert.ok(registry, 'Registry should maintain integrity during concurrent updates');
    
    // Clean up test files
    files.forEach(file => fs.unlinkSync(file));
  });
  
  suiteTeardown(() => {
    // Clean up test workspace
    if (fs.existsSync(testWorkspacePath)) {
      fs.rmSync(testWorkspacePath, { recursive: true, force: true });
    }
  });
}); 