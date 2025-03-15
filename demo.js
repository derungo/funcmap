const fs = require('fs');

// Function to read the AI function registry
function readAIFunctionRegistry() {
  try {
    const data = fs.readFileSync('ai-links.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading AI function registry:', error.message);
    return null;
  }
}

// Function to get data for a specific function
function getFunctionData(functionName) {
  const registry = readAIFunctionRegistry();
  if (!registry) return null;
  
  return registry.functions.find(func => func.functionName === functionName);
}

// Function to find functions that depend on a specific function
function findDependentFunctions(functionName) {
  const registry = readAIFunctionRegistry();
  if (!registry) return [];
  
  return registry.functions.filter(func => 
    func.dependsOn.includes(functionName)
  );
}

// Function to find functions related to a specific module
function findRelatedFunctions(moduleName) {
  const registry = readAIFunctionRegistry();
  if (!registry) return [];
  
  return registry.functions.filter(func => 
    func.related.includes(moduleName)
  );
}

// Function to find functions with a specific execution token
function findFunctionsByExecToken(token) {
  const registry = readAIFunctionRegistry();
  if (!registry) return [];
  
  return registry.functions.filter(func => 
    func.execTokens.includes(token)
  );
}

// Demo usage
console.log('\n=== AI Function Registry Demo ===\n');

// Get data for a specific function
const parseAITagsFunc = getFunctionData('parseAITags');
console.log('Function Data for parseAITags:');
console.log(parseAITagsFunc);
console.log();

// Find functions that depend on parseAITags
const dependentFunctions = findDependentFunctions('parseAITags');
console.log('Functions that depend on parseAITags:');
console.log(dependentFunctions);
console.log();

// Find functions related to AITag
const relatedFunctions = findRelatedFunctions('AITag');
console.log('Functions related to AITag:');
console.log(relatedFunctions);
console.log();

// Find functions with the index execution token
const indexFunctions = findFunctionsByExecToken('index');
console.log('Functions with the index execution token:');
console.log(indexFunctions);
console.log(); 