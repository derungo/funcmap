/**
 * Sanitizes function names and tag values to prevent injection and ensure valid identifiers
 */

// Allowed characters in function names and tag values
const VALID_NAME_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const VALID_PATH_REGEX = /^[a-zA-Z0-9_\-./]+$/;

/**
 * Error thrown when tag sanitization fails
 */
// @ai-link name=TagSanitizationError
// @ai-related Error
// @ai-exec error,security
export class TagSanitizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagSanitizationError';
  }
}

/**
 * Sanitizes a function name to ensure it's a valid identifier
 * @throws {TagSanitizationError} If the name is invalid
 */
// @ai-link name=sanitizeFunctionName
// @ai-depends on=TagSanitizationError,VALID_NAME_REGEX
// @ai-related sanitizeAITag
// @ai-exec security,validation
export function sanitizeFunctionName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new TagSanitizationError('Function name must be a non-empty string');
  }

  if (!VALID_NAME_REGEX.test(name)) {
    throw new TagSanitizationError(
      'Function name must be a valid identifier (start with letter/underscore, contain only letters/numbers/underscores)'
    );
  }

  return name;
}

/**
 * Sanitizes a file path to prevent directory traversal
 * @throws {TagSanitizationError} If the path is invalid
 */
// @ai-link name=sanitizeFilePath
// @ai-depends on=TagSanitizationError,VALID_PATH_REGEX
// @ai-related sanitizeAITag
// @ai-exec security,validation,filesystem
export function sanitizeFilePath(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new TagSanitizationError('File path must be a non-empty string');
  }

  if (!VALID_PATH_REGEX.test(path) || path.includes('..')) {
    throw new TagSanitizationError(
      'File path contains invalid characters or attempted directory traversal'
    );
  }

  return path;
}

/**
 * Sanitizes a comma-separated list of values
 * @throws {TagSanitizationError} If any value is invalid
 */
// @ai-link name=sanitizeTagList
// @ai-depends on=TagSanitizationError,VALID_NAME_REGEX
// @ai-related sanitizeAITag
// @ai-exec security,validation
export function sanitizeTagList(list: string): string[] {
  if (!list || typeof list !== 'string') {
    return [];
  }

  return list
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      if (!VALID_NAME_REGEX.test(item)) {
        throw new TagSanitizationError(
          `Invalid tag value: "${item}". Must be a valid identifier.`
        );
      }
      return item;
    });
}

/**
 * Sanitizes execution tokens
 * @throws {TagSanitizationError} If any token is invalid
 */
// @ai-link name=sanitizeExecTokens
// @ai-depends on=TagSanitizationError
// @ai-related sanitizeAITag
// @ai-exec security,validation,tokens
export function sanitizeExecTokens(tokens: string): string[] {
  if (!tokens || typeof tokens !== 'string') {
    return [];
  }

  const validTokens = ['test', 'benchmark', 'coverage', 'index', 'update', 'performance'];
  
  const sanitizedTokens = tokens
    .split(',')
    .map(token => token.trim().toLowerCase())
    .filter(token => token.length > 0);

  const invalidTokens = sanitizedTokens.filter(token => !validTokens.includes(token));
  if (invalidTokens.length > 0) {
    throw new TagSanitizationError(
      `Invalid execution tokens: ${invalidTokens.join(', ')}. Valid tokens are: ${validTokens.join(', ')}`
    );
  }

  return sanitizedTokens;
}

/**
 * Sanitizes all tag values in an AITag object
 * @throws {TagSanitizationError} If any value is invalid
 */
// @ai-link name=sanitizeAITag
// @ai-depends on=sanitizeFunctionName,sanitizeFilePath,sanitizeTagList,sanitizeExecTokens
// @ai-related TagSanitizationError
// @ai-exec security,validation,main
export function sanitizeAITag(tag: {
  filePath: string;
  functionName: string;
  dependsOn: string[];
  related: string[];
  execTokens: string[];
}): void {
  tag.filePath = sanitizeFilePath(tag.filePath);
  tag.functionName = sanitizeFunctionName(tag.functionName);
  
  // Convert arrays to comma-separated strings for sanitization
  const dependsOnStr = tag.dependsOn.join(',');
  const relatedStr = tag.related.join(',');
  const execTokensStr = tag.execTokens.join(',');
  
  tag.dependsOn = sanitizeTagList(dependsOnStr);
  tag.related = sanitizeTagList(relatedStr);
  tag.execTokens = sanitizeExecTokens(execTokensStr);
} 