import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { updateIndex } from '../commands/updateIndex';
import { AITag } from '../parser/aiTagParser';
import { performance } from 'perf_hooks';

// Import mock context from updateIndex.test.ts
import { mockContext } from './updateIndex.test';

suite('Performance Tests', () => {
  const testWorkspacePath = path.join(__dirname, '../../../test-workspace');
  const SAMPLE_SIZES = [10, 100, 1000, 5000];
  
  suiteSetup(async () => {
    if (!fs.existsSync(testWorkspacePath)) {
      fs.mkdirSync(testWorkspacePath, { recursive: true });
    }
  });
  
  setup(async () => {
    const jsonPath = path.join(testWorkspacePath, 'funcmap.json');
    const sqlitePath = path.join(testWorkspacePath, 'funcmap.db');
    
    if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
    if (fs.existsSync(sqlitePath)) fs.unlinkSync(sqlitePath);
  });
  
  /**
   * Generates test files with the specified number of functions
   */
  function generateTestFiles(numFunctions: number): string[] {
    const FILES_PER_BATCH = 100;
    const functionsPerFile = Math.ceil(numFunctions / FILES_PER_BATCH);
    const files: string[] = [];
    
    let remainingFunctions = numFunctions;
    let fileIndex = 0;
    
    while (remainingFunctions > 0) {
      const filePath = path.join(testWorkspacePath, `test${fileIndex}.ts`);
      let content = '';
      
      const functionsInThisFile = Math.min(functionsPerFile, remainingFunctions);
      for (let i = 0; i < functionsInThisFile; i++) {
        const globalIndex = numFunctions - remainingFunctions + i;
        content += `
          // @ai-link name=function${globalIndex}
          // @ai-depends on=helper${globalIndex}
          // @ai-related Module${Math.floor(globalIndex / 10)}
          // @ai-exec test,benchmark
          function function${globalIndex}() {
            // Implementation with some complexity
            const result = Array.from({ length: 10 }, (_, i) => i * 2);
            return result.reduce((a, b) => a + b, 0);
          }
        `;
      }
      
      fs.writeFileSync(filePath, content);
      files.push(filePath);
      
      remainingFunctions -= functionsInThisFile;
      fileIndex++;
    }
    
    return files;
  }
  
  /**
   * Runs a benchmark test for the specified storage type and sample size
   */
  async function runBenchmark(storageType: 'json' | 'sqlite', numFunctions: number): Promise<{
    indexingTime: number;
    queryTime: number;
    fileSize: number;
  }> {
    // Configure storage type
    const config = vscode.workspace.getConfiguration('funcmap');
    await config.update('storageType', storageType, vscode.ConfigurationTarget.Global);
    
    // Generate test files
    const start = performance.now();
    const files = generateTestFiles(numFunctions);
    
    // Run indexing
    await updateIndex(mockContext);
    const indexingTime = performance.now() - start;
    
    // Measure query time (average of 100 random queries)
    const queryStart = performance.now();
    for (let i = 0; i < 100; i++) {
      const randomIndex = Math.floor(Math.random() * numFunctions);
      await vscode.commands.executeCommand<AITag>('funcmap.getFunctionData', `function${randomIndex}`);
    }
    const queryTime = (performance.now() - queryStart) / 100; // Average query time
    
    // Measure file size
    const filePath = path.join(testWorkspacePath, storageType === 'json' ? 'funcmap.json' : 'funcmap.db');
    const fileSize = fs.statSync(filePath).size;
    
    // Clean up test files
    files.forEach(file => fs.unlinkSync(file));
    
    return { indexingTime, queryTime, fileSize };
  }
  
  test('Storage Performance Comparison', async function() {
    this.timeout(300000); // 5 minutes timeout for large tests
    
    const results: {
      sampleSize: number;
      json: { indexingTime: number; queryTime: number; fileSize: number };
      sqlite: { indexingTime: number; queryTime: number; fileSize: number };
    }[] = [];
    
    for (const sampleSize of SAMPLE_SIZES) {
      const jsonResults = await runBenchmark('json', sampleSize);
      const sqliteResults = await runBenchmark('sqlite', sampleSize);
      
      results.push({
        sampleSize,
        json: jsonResults,
        sqlite: sqliteResults
      });
      
      // Log results
      console.log(`\nSample size: ${sampleSize} functions`);
      console.log('JSON Storage:');
      console.log(`  Indexing time: ${jsonResults.indexingTime.toFixed(2)}ms`);
      console.log(`  Average query time: ${jsonResults.queryTime.toFixed(2)}ms`);
      console.log(`  File size: ${(jsonResults.fileSize / 1024).toFixed(2)}KB`);
      
      console.log('SQLite Storage:');
      console.log(`  Indexing time: ${sqliteResults.indexingTime.toFixed(2)}ms`);
      console.log(`  Average query time: ${sqliteResults.queryTime.toFixed(2)}ms`);
      console.log(`  File size: ${(sqliteResults.fileSize / 1024).toFixed(2)}KB`);
      
      // Verify performance expectations
      if (sampleSize >= 1000) {
        // For large datasets, SQLite should be faster at querying
        assert.ok(
          sqliteResults.queryTime < jsonResults.queryTime,
          `SQLite query time (${sqliteResults.queryTime}ms) should be faster than JSON (${jsonResults.queryTime}ms) for ${sampleSize} functions`
        );
      }
    }
  });
  
  suiteTeardown(() => {
    if (fs.existsSync(testWorkspacePath)) {
      fs.rmSync(testWorkspacePath, { recursive: true, force: true });
    }
  });
}); 