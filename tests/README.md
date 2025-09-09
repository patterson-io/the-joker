# Agent Test Suite

This directory contains test files that demonstrate the functionality of each agent defined in the `.github/agents/` directory.

## Test Files Overview

### 1. Joker Agent Test (`joker-test.md`)
- **Purpose**: Demonstrates the Joker agent functionality
- **Expected Behavior**: The agent should add random jokes at the bottom of any .md file it generates
- **Format**: Joke should be preceded by "---" and a newline
- **Requirements**: Jokes should be about a sentence long and safe for work

### 2. JavaScript Pro Agent Test (`javascript-pro-test.js`)
- **Purpose**: Demonstrates modern JavaScript expertise
- **Features Tested**:
  - ES6+ features (destructuring, classes, modules)
  - Async patterns (promises, async/await, generators)
  - Error handling and race condition prevention
  - Modern Node.js patterns
  - JSDoc comments
  - Functional programming patterns

### 3. Spanish Agent Test (`spanish-agent-test.js`)
- **Purpose**: Demonstrates Spanish naming conventions
- **Features Tested**:
  - All variables named in Spanish
  - All methods named in Spanish
  - All identifiers in Spanish
  - Error messages and strings in Spanish
  - Proper Spanish programming terminology

## Running the Tests

These test files serve as examples and documentation of each agent's capabilities. They can be used to:

1. Verify agent functionality
2. Provide examples for users
3. Validate that agents are working as expected
4. Serve as documentation for agent capabilities

## Validation Checklist

- [ ] Joker agent adds jokes to .md files
- [ ] JavaScript Pro agent uses modern JS patterns
- [ ] Spanish agent uses Spanish identifiers consistently
- [ ] All code follows best practices for their respective domains
- [ ] Test files demonstrate the full range of each agent's capabilities

---

Why did the developer break up with their IDE? Because it kept giving them the silent treatment with null pointer exceptions!