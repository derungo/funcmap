# Change Log

All notable changes to the "funcmap" extension will be documented in this file.

## [0.4.0] - 2024-03-15

### Added
- Native integration with Cursor Composer through global `funcmapForComposer` object
- New search functionality across all indexed functions
- Ability to retrieve all indexed functions at once
- Improved documentation with Cursor Composer integration guide

### Changed
- Refactored storage implementations for better type safety
- Enhanced SQLite query performance with optimized indexes
- Updated README with Cursor Composer integration examples

### Fixed
- Type safety issues in storage implementations
- Null handling in database operations
- Documentation formatting and examples

## [0.3.0] - 2024-03-14

### Added
- SQLite storage backend for improved performance
- File watching capability for automatic index updates
- Support for execution tokens with @ai-exec tag

### Changed
- Improved error handling and logging
- Better TypeScript type definitions
- Enhanced documentation

## [0.2.0] - 2024-03-13

### Added
- JSON storage implementation
- Basic function registry functionality
- Support for @ai-link, @ai-depends, and @ai-related tags

### Changed
- Initial public release
- Basic documentation

## [0.1.0] - 2024-03-12

### Added
- Initial extension setup
- Basic function parsing
- Project structure and documentation 