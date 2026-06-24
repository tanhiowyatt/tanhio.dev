# Test Suite Documentation

This directory contains comprehensive tests for the tanhiowyatt website.

## Test Structure

- `unit/` - Unit tests for individual components
- `integration/` - Integration tests for component interactions
- `e2e/` - End-to-end tests using Playwright
- `security/` - Security vulnerability tests
- `a11y/` - Accessibility tests

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests
npm run test:security      # Security tests
npm run test:a11y          # Accessibility tests
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Requirements

- **Minimum Coverage**: 80% code coverage required
- **Test Isolation**: All tests must be isolated and reproducible
- **Mock Data**: External dependencies must be mocked

## Test Categories

### Unit Tests
Test individual functions and components in isolation.

### Integration Tests
Test how components work together.

### E2E Tests
Test complete user workflows from start to finish.

### Security Tests
- XSS attack prevention
- CSP header validation
- Input sanitization
- URL validation

### Accessibility Tests
- Semantic markup
- Color contrast
- Alt text presence
- Keyboard navigation
- Screen reader compatibility

## Continuous Integration

Tests should be run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment

## Writing New Tests

1. Place tests in the appropriate directory
2. Follow existing test patterns
3. Ensure tests are isolated and don't depend on external services
4. Mock external dependencies
5. Aim for >80% code coverage

