const fs = require('fs');
const path = require('path');

// Custom error types
class RegistryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RegistryError';
  }
}

class RegistryNotFoundError extends RegistryError {
  constructor() {
    super('Function registry file not found');
    this.name = 'RegistryNotFoundError';
  }
}

class RegistryParseError extends RegistryError {
  constructor(message) {
    super(`Failed to parse function registry: ${message}`);
    this.name = 'RegistryParseError';
  }
}

// Function to read the function registry
function readFunctionRegistry() {
  try {
    // Safely resolve path relative to current directory
    const registryPath = path.resolve(__dirname, 'funcmap.json');
    
    // Check if file exists
    if (!fs.existsSync(registryPath)) {
      throw new RegistryNotFoundError();
    }
    
    const data = fs.readFileSync(registryPath, 'utf8');
    
    try {
      const registry = JSON.parse(data);
      
      // Validate registry structure
      if (!registry || !Array.isArray(registry.functions)) {
        throw new RegistryParseError('Invalid registry format');
      }
      
      return registry;
    } catch (parseError) {
      throw new RegistryParseError(parseError.message);
    }
  } catch (error) {
    if (error instanceof RegistryError) {
      console.error(`Registry Error: ${error.message}`);
    } else {
      console.error('Unexpected error reading function registry:', error.message);
    }
    return null;
  }
}

// Function to get data for a specific function
function getFunctionData(functionName) {
  if (!functionName || typeof functionName !== 'string') {
    throw new Error('Invalid function name');
  }
  
  const registry = readFunctionRegistry();
  if (!registry) return null;
  
  return registry.functions.find(func => func.functionName === functionName);
}

// Function to find functions that depend on a specific function
function findDependentFunctions(functionName) {
  if (!functionName || typeof functionName !== 'string') {
    throw new Error('Invalid function name');
  }
  
  const registry = readFunctionRegistry();
  if (!registry) return [];
  
  return registry.functions.filter(func => 
    Array.isArray(func.dependsOn) && func.dependsOn.includes(functionName)
  );
}

// Function to find functions related to a specific module
function findRelatedFunctions(moduleName) {
  if (!moduleName || typeof moduleName !== 'string') {
    throw new Error('Invalid module name');
  }
  
  const registry = readFunctionRegistry();
  if (!registry) return [];
  
  return registry.functions.filter(func => 
    Array.isArray(func.related) && func.related.includes(moduleName)
  );
}

// Function to find functions with a specific execution token
function findFunctionsByExecToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid execution token');
  }
  
  const registry = readFunctionRegistry();
  if (!registry) return [];
  
  return registry.functions.filter(func => 
    Array.isArray(func.execTokens) && func.execTokens.includes(token)
  );
}

// Demo usage with error handling
async function runDemo() {
  console.log('\n=== FuncMap Registry Demo ===\n');

  try {
    // Get data for a specific function
    const parseAITagsFunc = getFunctionData('parseAITags');
    console.log('Function Data for parseAITags:');
    console.log(parseAITagsFunc || 'Function not found');
    console.log();

    // Find functions that depend on parseAITags
    const dependentFunctions = findDependentFunctions('parseAITags');
    console.log('Functions that depend on parseAITags:');
    console.log(dependentFunctions.length ? dependentFunctions : 'No dependent functions found');
    console.log();

    // Find functions related to AITag
    const relatedFunctions = findRelatedFunctions('AITag');
    console.log('Functions related to AITag:');
    console.log(relatedFunctions.length ? relatedFunctions : 'No related functions found');
    console.log();

    // Find functions with the index execution token
    const indexFunctions = findFunctionsByExecToken('index');
    console.log('Functions with the index execution token:');
    console.log(indexFunctions.length ? indexFunctions : 'No functions found with this token');
    console.log();
  } catch (error) {
    console.error('Demo execution failed:', error.message);
  }
}

// Run the demo
runDemo(); 