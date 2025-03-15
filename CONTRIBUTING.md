# Contributing to AI Contextual Linking & Execution System

Thank you for your interest in contributing to the AI Contextual Linking & Execution System! This document outlines the guidelines for contributing to this project.

## Git Workflow

### Branching Strategy

- `main`: The main branch contains the stable version of the project
- `develop`: Development branch where features are integrated
- Feature branches: Create from `develop` with the naming convention `feature/feature-name`
- Bug fix branches: Create from `develop` with the naming convention `fix/bug-name`

### Commit Guidelines

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Code changes that improve performance
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

#### Scope

The scope should be the name of the module affected (e.g., parser, storage, commands).

#### Subject

The subject should be a short description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end

#### Body

The body should include the motivation for the change and contrast this with previous behavior.

#### Footer

The footer should contain any information about Breaking Changes and reference GitHub issues that this commit closes.

#### Examples

```
feat(parser): add support for class methods

Extend the parser to detect AI tags in class methods in addition to functions.

Closes #123
```

```
fix(storage): resolve issue with JSON file path

Fix the path resolution for the JSON storage file when working with multi-root workspaces.

Fixes #456
```

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the documentation with details of changes if appropriate
3. The PR should work in all supported environments (VS Code, Cursor)
4. PRs require at least one approval from a maintainer

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/funcmap.git`
3. Install dependencies: `npm install`
4. Create a branch for your changes: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Run tests: `npm test`
7. Commit your changes following the commit guidelines
8. Push to your fork and submit a pull request

## Code Style

- Use TypeScript for all code
- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new functionality

Thank you for contributing to the AI Contextual Linking & Execution System! 