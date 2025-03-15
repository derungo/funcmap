# Changelog

## [0.3.0] - 2024-03-15

### Added
- **Graceful Fallback Mechanism**
  - Added automatic fallback to JSON storage when SQLite initialization fails
  - Improved error handling for storage type initialization
  - Better user notifications for storage-related issues

### Changed
- Enhanced error reporting for native module failures
- Improved package scripts for better installation experience
- Added better error handling during initialization
- Updated module structure for more resilient operation

### Fixed
- Fixed NODE_MODULE_VERSION mismatch issue with better-sqlite3
- Fixed incompatibility issues with newer Node.js versions
- Fixed extension activation failures by adding graceful degradation
- Improved error handling for better user experience

## [0.2.0] - 2024-03-XX

### Added
- **Performance Benchmarking**
  - Added comprehensive performance test suite
  - Benchmarks for JSON vs SQLite storage
  - Tests different sample sizes (10, 100, 1000, 5000 functions)
  - Measures indexing time, query time, and file size
  - Includes performance assertions for large datasets

- **Input Sanitization**
  - Added tag sanitizer utility
  - Function name validation
  - File path sanitization with directory traversal prevention
  - Tag value validation
  - Execution token validation
  - Custom error handling for invalid inputs

- **Progress Reporting**
  - Added granular progress steps
  - Progress percentage indicators
  - Detailed progress messages
  - User cancellation support
  - Operation cleanup on cancellation

- **Rate Limiting**
  - Added debounce utility for file watching
  - Configurable debounce time (default: 1 second)
  - Prevents excessive updates during rapid file changes
  - TypeScript type safety for debounced functions

### Changed
- Improved error handling with custom error types
- Enhanced progress reporting in updateIndex command
- Optimized file watching with rate limiting
- Added TypeScript type safety improvements

### Fixed
- Fixed concurrent update handling
- Fixed directory traversal vulnerability in file paths
- Fixed memory leaks in file watchers
- Fixed error propagation in async operations

## [0.1.0] - Initial Release

### Added
- Initial implementation of FuncMap extension
- Basic function detection and parsing
- JSON and SQLite storage options
- File watching capabilities
- Basic AI tag support (@ai-link, @ai-depends, @ai-related, @ai-exec) 